import { GuardSettings, GuardState } from './types';

export const LOCATION_TASK_NAME = 'umbrella-guard-location-task';
export const BACKGROUND_FETCH_TASK_NAME = 'umbrella-guard-background-fetch-task';
export const NOTIFICATION_CHANNEL_ID = 'umbrella-reminders';

export const DEFAULT_SETTINGS: GuardSettings = {
  stayRadiusMeters: 100,
  stayDurationMinutes: 10,
  moveDistanceMeters: 300,
  cooldownMinutes: 60,
  debugMode: true,
};

export const DEFAULT_STATE: GuardState = {
  status: 'IDLE',
  locationStarted: false,
  foregroundPermission: 'unknown',
  backgroundPermission: 'unknown',
  notificationPermission: 'unknown',
  currentLocation: null,
  anchorLocation: null,
  stayStartedAt: null,
  stayingSince: null,
  movingDistanceMeters: 0,
  lastNotificationAt: null,
  cooldownUntil: null,
  lastError: null,
};

export const LOCATION_WATCH_INTERVAL_MS = 60_000;
export const LOCATION_WATCH_DISTANCE_M = 25;
