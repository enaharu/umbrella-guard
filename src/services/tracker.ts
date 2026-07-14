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
    trackingStartedAt: state.trackingStartedAt ?? point.timestamp,
    stayStartedAt: point.timestamp,
    stayingSince: null,
    movingDistanceMeters: 0,
    cooldownUntil: null,
    lastError: null,
  };
}

async function finishCooldownIfNeeded(state: GuardState, point: LocationPoint): Promise<GuardState> {
  if (state.status !== 'COOLDOWN' || !state.cooldownUntil || point.timestamp < state.cooldownUntil) {
    return state;
  }

  await addLog({ kind: 'cooldown-ended', title: 'クールダウン終了' }, point.timestamp);
  return {
    ...state,
    status: 'IDLE',
    currentLocation: point,
    anchorLocation: point,
    stayStartedAt: point.timestamp,
    stayingSince: null,
    movingDistanceMeters: 0,
    cooldownUntil: null,
  };
}

export async function processLocationPoint(point: LocationPoint, shouldNotify = true) {
  const [settings, savedState] = await Promise.all([loadSettings(), loadState()]);

  if (!settings.enabled) {
    const nextState: GuardState = {
      ...savedState,
      status: 'IDLE',
      currentLocation: point,
      anchorLocation: null,
      trackingStartedAt: null,
      stayStartedAt: null,
      stayingSince: null,
      locationStarted: false,
      movingDistanceMeters: 0,
      cooldownUntil: null,
      lastError: null,
    };
    await saveState(nextState);
    return nextState;
  }

  let state = await finishCooldownIfNeeded(savedState, point);

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
      const cooldownState: GuardState = {
        ...movedState,
        status: 'COOLDOWN',
        currentLocation: point,
        movingDistanceMeters: Math.round(distanceFromAnchor),
        cooldownUntil,
      };
      await saveState(cooldownState);

      if (!shouldNotify) {
        return cooldownState;
      }

      try {
        await sendUmbrellaNotification('movement');
        const notifiedState = {
          ...cooldownState,
          lastNotificationAt: point.timestamp,
          lastError: null,
        };
        await saveState(notifiedState);
        await addLog({ kind: 'notification-sent', title: '通知を送信', detail: '「傘忘れてない？」' }, point.timestamp);
        return notifiedState;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown notification error';
        const failedState = { ...cooldownState, lastError: message };
        await saveState(failedState);
        await addLog({ kind: 'system', title: '通知送信エラー', detail: message }, point.timestamp);
        return failedState;
      }
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
  const startedAt = state.trackingStartedAt ?? state.stayStartedAt;
  if (!startedAt) {
    return 0;
  }
  return Math.max(0, Date.now() - startedAt);
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
