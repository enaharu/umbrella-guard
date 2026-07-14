import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

import { DEFAULT_SETTINGS, DEFAULT_STATE } from '../constants/config';
import { GuardSettings, GuardSnapshot, GuardState } from '../constants/types';
import {
  processCurrentLocation,
  registerBackgroundTask,
  requestLocationPermissions,
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
  syncLocationPermissions,
  unregisterBackgroundTask,
  watchForegroundLocation,
} from '../services/locationService';
import {
  configureNotificationHandler,
  isNotificationPermissionGranted,
  requestNotificationPermission,
  sendUmbrellaNotification,
} from '../services/notifications';
import { addLog, loadSnapshot, saveSettings, saveState } from '../services/storage';

export function useUmbrellaGuard() {
  const [snapshot, setSnapshot] = useState<GuardSnapshot>({
    state: DEFAULT_STATE,
    settings: DEFAULT_SETTINGS,
    logs: [],
  });
  const [isReady, setReady] = useState(false);
  const foregroundSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async () => {
    const nextSnapshot = await loadSnapshot();
    setSnapshot(nextSnapshot);
    return nextSnapshot;
  }, []);

  const resetTrackingState = useCallback(async (partialState: Partial<GuardState> = {}) => {
    const current = await loadSnapshot();
    await saveState({
      ...current.state,
      status: 'IDLE',
      anchorLocation: null,
      trackingStartedAt: Date.now(),
      stayStartedAt: null,
      stayingSince: null,
      cooldownUntil: null,
      movingDistanceMeters: 0,
      lastError: null,
      ...partialState,
    });
  }, []);

  const stopServices = useCallback(async () => {
    foregroundSubscriptionRef.current?.remove();
    foregroundSubscriptionRef.current = null;
    await stopBackgroundLocationUpdates();
    await unregisterBackgroundTask();
    await resetTrackingState({ locationStarted: false, trackingStartedAt: null });
    await refresh();
  }, [refresh, resetTrackingState]);

  const startServices = useCallback(async (resetTracking = false) => {
    try {
      if (resetTracking) {
        await resetTrackingState({ locationStarted: false });
      }

      configureNotificationHandler();
      const locationPermissions = await requestLocationPermissions();
      if (
        locationPermissions.foregroundPermission === 'denied' ||
        locationPermissions.backgroundPermission === 'denied'
      ) {
        throw new Error('位置情報のForegroundとBackgroundの両方を許可してください。');
      }

      const notificationGranted = await requestNotificationPermission();
      const current = await loadSnapshot();
      await saveState({
        ...current.state,
        notificationPermission: notificationGranted ? 'granted' : 'denied',
        lastError: null,
      });

      await processCurrentLocation();
      await startBackgroundLocationUpdates();
      await registerBackgroundTask();
      foregroundSubscriptionRef.current?.remove();
      foregroundSubscriptionRef.current = await watchForegroundLocation(refresh);
    } catch (error) {
      const current = await loadSnapshot();
      await saveState({
        ...current.state,
        lastError: error instanceof Error ? error.message : 'Unknown startup error',
      });
      await addLog({
        kind: 'system',
        title: '起動処理エラー',
        detail: error instanceof Error ? error.message : 'Unknown startup error',
      });
    } finally {
      await refresh();
    }
  }, [refresh, resetTrackingState]);

  const syncPermissions = useCallback(async () => {
    const [locationState, notificationGranted] = await Promise.all([
      syncLocationPermissions(),
      isNotificationPermissionGranted(),
    ]);
    const current = await loadSnapshot();
    const nextState: GuardState = {
      ...current.state,
      foregroundPermission: locationState.foregroundPermission,
      backgroundPermission: locationState.backgroundPermission,
      notificationPermission: notificationGranted ? 'granted' : 'denied',
    };
    await saveState(nextState);
    await refresh();
    return { state: nextState, settings: current.settings };
  }, [refresh]);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      configureNotificationHandler();
      const current = await refresh();

      if (current.settings.enabled) {
        await startServices(!current.state.trackingStartedAt);
      } else {
        await stopServices();
      }

      if (isMounted) {
        await refresh();
        setReady(true);
      }
    }

    boot();

    return () => {
      isMounted = false;
      foregroundSubscriptionRef.current?.remove();
      foregroundSubscriptionRef.current = null;
    };
  }, [refresh, startServices, stopServices]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, 15_000);

    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasAway = appStateRef.current === 'inactive' || appStateRef.current === 'background';
      appStateRef.current = nextState;

      if (nextState !== 'active' || !wasAway) {
        return;
      }

      void (async () => {
        const current = await syncPermissions();
        const hasLocationPermission =
          current.state.foregroundPermission === 'granted' && current.state.backgroundPermission === 'granted';
        if (current.settings.enabled && hasLocationPermission && !current.state.locationStarted) {
          await startServices(!current.state.trackingStartedAt);
        }
      })();
    });

    return () => subscription.remove();
  }, [startServices, syncPermissions]);

  const updateSettings = useCallback(
    async (partial: Partial<GuardSettings>) => {
      const nextSettings = { ...snapshot.settings, ...partial };
      await saveSettings(nextSettings);
      await refresh();
      if (partial.enabled !== undefined && partial.enabled !== snapshot.settings.enabled) {
        if (partial.enabled) {
          await startServices(true);
        } else {
          await stopServices();
        }
      }
    },
    [refresh, snapshot.settings, startServices, stopServices]
  );

  const sendTestNotification = useCallback(async () => {
    const now = Date.now();
    try {
      await sendUmbrellaNotification('test');
      const current = await loadSnapshot();
      await saveState({
        ...current.state,
        lastNotificationAt: now,
        lastError: null,
      });
      await addLog({ kind: 'notification-sent', title: '通知テスト', detail: '手動で通知を送信' }, now);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown notification error';
      const current = await loadSnapshot();
      await saveState({
        ...current.state,
        lastError: message,
      });
      await addLog({ kind: 'system', title: '通知テストエラー', detail: message }, now);
    } finally {
      await refresh();
    }
  }, [refresh]);

  const statusLabel = useMemo(() => {
    switch (snapshot.state.status) {
      case 'STAYING':
        return '滞在中';
      case 'MOVING':
        return '移動中';
      case 'COOLDOWN':
        return '待機中';
      default:
        return '観測中';
    }
  }, [snapshot.state.status]);

  return {
    ...snapshot,
    isReady,
    statusLabel,
    refresh,
    updateSettings,
    sendTestNotification,
  };
}

export type UmbrellaGuardController = ReturnType<typeof useUmbrellaGuard>;
