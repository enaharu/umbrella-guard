import { GuardSettings, GuardState } from './types';

export const LOCATION_TASK_NAME = 'umbrella-guard-location-task';
export const BACKGROUND_TASK_NAME = 'umbrella-guard-background-task';
export const NOTIFICATION_CHANNEL_ID = 'umbrella-reminders';
export const COOLDOWN_MINUTES_MIN = 1;
export const COOLDOWN_MINUTES_MAX = 30;

export const DEFAULT_SETTINGS: GuardSettings = {
  enabled: true,
  stayRadiusMeters: 100,
  stayDurationMinutes: 10,
  moveDistanceMeters: 300,
  cooldownMinutes: 10,
};

export const DEFAULT_STATE: GuardState = {
  status: 'IDLE',
  locationStarted: false,
  foregroundPermission: 'unknown',
  backgroundPermission: 'unknown',
  notificationPermission: 'unknown',
  currentLocation: null,
  anchorLocation: null,
  trackingStartedAt: null,
  stayStartedAt: null,
  stayingSince: null,
  movingDistanceMeters: 0,
  lastNotificationAt: null,
  cooldownUntil: null,
  lastError: null,
};

export const LOCATION_WATCH_INTERVAL_MS = 60_000;
export const LOCATION_WATCH_DISTANCE_M = 25;
