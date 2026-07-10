import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import {
  BACKGROUND_FETCH_TASK_NAME,
  LOCATION_TASK_NAME,
  LOCATION_WATCH_DISTANCE_M,
  LOCATION_WATCH_INTERVAL_MS,
} from '../constants/config';
import { GuardState, LocationPoint } from '../constants/types';
import { addLog, loadState, saveState } from './storage';
import { processLocationPoint } from './tracker';

function permissionState(granted: boolean) {
  return granted ? 'granted' : 'denied';
}

export function toPoint(location: Location.LocationObject): LocationPoint {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp: location.timestamp ?? Date.now(),
  };
}

async function updatePermissionState(partial: Partial<GuardState>) {
  const state = await loadState();
  const nextState = { ...state, ...partial };
  await saveState(nextState);
  return nextState;
}

export async function requestLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  let backgroundGranted = false;

  if (foreground.granted) {
    const background = await Location.requestBackgroundPermissionsAsync();
    backgroundGranted = background.granted;
  }

  await addLog(
    {
      kind: 'permission',
      title: '位置情報権限を確認',
      detail: `Foreground ${foreground.granted ? '許可' : '未許可'} / Background ${
        backgroundGranted ? '許可' : '未許可'
      }`,
    },
    Date.now()
  );

  return updatePermissionState({
    foregroundPermission: permissionState(foreground.granted),
    backgroundPermission: permissionState(backgroundGranted),
  });
}

export async function startBackgroundLocationUpdates() {
  if (Platform.OS === 'web') {
    return false;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_WATCH_INTERVAL_MS,
      distanceInterval: LOCATION_WATCH_DISTANCE_M,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: '傘おかんアプリ',
        notificationBody: '傘忘れ防止のため位置情報を確認しています',
        notificationColor: '#2f73df',
      },
    });
  }

  await updatePermissionState({ locationStarted: true });
  return true;
}

export async function registerBackgroundFetch() {
  if (Platform.OS === 'web') {
    return;
  }

  const isDefined = TaskManager.isTaskDefined(BACKGROUND_FETCH_TASK_NAME);
  if (!isDefined) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK_NAME, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

export async function processCurrentLocation() {
  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return processLocationPoint(toPoint(current), true);
}

export async function watchForegroundLocation(onUpdate: () => void) {
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_WATCH_INTERVAL_MS,
      distanceInterval: LOCATION_WATCH_DISTANCE_M,
    },
    async (location) => {
      await processLocationPoint(toPoint(location), true);
      onUpdate();
    }
  );

  return subscription;
}
