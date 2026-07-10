import { GuardSettings, GuardState, LocationPoint } from '../constants/types';
import { distanceMeters } from './distance';
import { addLog, loadSettings, loadState, saveState } from './storage';
import { sendUmbrellaNotification } from './notifications';

function minutesToMs(minutes: number) {
  return minutes * 60 * 1000;
}

function buildIdleFrom(point: LocationPoint, state: GuardState): GuardState {
  return {
    ...state,
    status: 'IDLE',
    currentLocation: point,
    anchorLocation: point,
    stayStartedAt: point.timestamp,
    stayingSince: null,
    movingDistanceMeters: 0,
    cooldownUntil: null,
    lastError: null,
  };
}

async function finishCooldownIfNeeded(state: GuardState, now: number): Promise<GuardState> {
  if (state.status !== 'COOLDOWN' || !state.cooldownUntil || now < state.cooldownUntil) {
    return state;
  }

  await addLog({ kind: 'cooldown-ended', title: 'クールダウン終了' }, now);
  return {
    ...state,
    status: 'IDLE',
    anchorLocation: state.currentLocation,
    stayStartedAt: state.currentLocation?.timestamp ?? now,
    stayingSince: null,
    movingDistanceMeters: 0,
    cooldownUntil: null,
  };
}

export async function processLocationPoint(point: LocationPoint, shouldNotify = true) {
  const [settings, savedState] = await Promise.all([loadSettings(), loadState()]);
  let state = await finishCooldownIfNeeded(savedState, point.timestamp);

  if (!state.anchorLocation || !state.stayStartedAt) {
    const nextState = buildIdleFrom(point, state);
    await saveState(nextState);
    return nextState;
  }

  const stayStartedAt = state.stayStartedAt;
  const distanceFromAnchor = distanceMeters(state.anchorLocation, point);
  state = {
    ...state,
    currentLocation: point,
    movingDistanceMeters: Math.round(distanceFromAnchor),
    lastError: null,
  };

  if (state.status === 'COOLDOWN') {
    await saveState(state);
    return state;
  }

  if (state.status === 'STAYING') {
    if (distanceFromAnchor >= settings.moveDistanceMeters) {
      const movedState: GuardState = { ...state, status: 'MOVING' };
      await saveState(movedState);
      await addLog(
        {
          kind: 'moving-started',
          title: '移動開始を検知',
          detail: `移動距離 ${Math.round(distanceFromAnchor)}m`,
        },
        point.timestamp
      );

      const cooldownUntil = point.timestamp + minutesToMs(settings.cooldownMinutes);
      if (shouldNotify) {
        await sendUmbrellaNotification('movement');
      }
      await addLog({ kind: 'notification-sent', title: '通知を送信', detail: '「傘忘れてない？」' }, point.timestamp);

      const cooldownState: GuardState = {
        ...movedState,
        status: 'COOLDOWN',
        currentLocation: point,
        movingDistanceMeters: Math.round(distanceFromAnchor),
        lastNotificationAt: point.timestamp,
        cooldownUntil,
      };
      await saveState(cooldownState);
      return cooldownState;
    }

    await saveState(state);
    return state;
  }

  if (distanceFromAnchor <= settings.stayRadiusMeters) {
    const stayDuration = point.timestamp - stayStartedAt;
    if (stayDuration >= minutesToMs(settings.stayDurationMinutes)) {
      const stayingState: GuardState = {
        ...state,
        status: 'STAYING',
        stayingSince: stayStartedAt,
      };
      await saveState(stayingState);
      await addLog(
        {
          kind: 'stay-started',
          title: '滞在開始',
          detail: `半径${settings.stayRadiusMeters}m以内で${settings.stayDurationMinutes}分経過`,
        },
        point.timestamp
      );
      return stayingState;
    }

    await saveState(state);
    return state;
  }

  const resetState = buildIdleFrom(point, state);
  await saveState(resetState);
  return resetState;
}

export function getStayDurationMs(state: GuardState) {
  if (!state.stayStartedAt) {
    return 0;
  }
  return Math.max(0, Date.now() - state.stayStartedAt);
}

export function getNextCondition(state: GuardState, settings: GuardSettings) {
  if (state.status === 'COOLDOWN' && state.cooldownUntil) {
    return `再通知まで約${Math.max(0, Math.ceil((state.cooldownUntil - Date.now()) / 60_000))}分`;
  }
  if (state.status === 'STAYING') {
    return `${settings.moveDistanceMeters}m以上移動で通知`;
  }
  return `半径${settings.stayRadiusMeters}m以内で${settings.stayDurationMinutes}分滞在`;
}
