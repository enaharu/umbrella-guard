import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';

import { DEFAULT_SETTINGS, DEFAULT_STATE } from '../constants/config';
import { GuardSettings, GuardSnapshot } from '../constants/types';
import {
  processCurrentLocation,
  registerBackgroundFetch,
  requestLocationPermissions,
  startBackgroundLocationUpdates,
  watchForegroundLocation,
} from '../services/locationService';
import { configureNotificationHandler, requestNotificationPermission, sendUmbrellaNotification } from '../services/notifications';
import { addLog, loadSnapshot, saveSettings, saveState } from '../services/storage';

export function useUmbrellaGuard() {
  const [snapshot, setSnapshot] = useState<GuardSnapshot>({
    state: DEFAULT_STATE,
    settings: DEFAULT_SETTINGS,
    logs: [],
  });
  const [isReady, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const nextSnapshot = await loadSnapshot();
    setSnapshot(nextSnapshot);
    return nextSnapshot;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function boot() {
      configureNotificationHandler();
      await refresh();

      try {
        await requestLocationPermissions();
        const notificationGranted = await requestNotificationPermission();
        const current = await loadSnapshot();
        await saveState({
          ...current.state,
          notificationPermission: notificationGranted ? 'granted' : 'denied',
        });

        await processCurrentLocation();
        await startBackgroundLocationUpdates();
        await registerBackgroundFetch();
        subscription = await watchForegroundLocation(refresh);
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
        if (isMounted) {
          await refresh();
          setReady(true);
        }
      }
    }

    boot();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [refresh]);

  const updateSettings = useCallback(
    async (partial: Partial<GuardSettings>) => {
      const nextSettings = { ...snapshot.settings, ...partial };
      await saveSettings(nextSettings);
      await refresh();
    },
    [refresh, snapshot.settings]
  );

  const sendTestNotification = useCallback(async () => {
    await sendUmbrellaNotification('test');
    await addLog({ kind: 'notification-sent', title: '通知テスト', detail: '手動で通知を送信' });
    await refresh();
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
