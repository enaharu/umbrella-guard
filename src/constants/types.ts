export type AppScreen = 'home' | 'logs' | 'settings';

export type GuardStatus = 'IDLE' | 'STAYING' | 'MOVING' | 'COOLDOWN';

export type PermissionState = 'unknown' | 'granted' | 'denied';

export type LocationPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type GuardSettings = {
  stayRadiusMeters: number;
  stayDurationMinutes: number;
  moveDistanceMeters: number;
  cooldownMinutes: number;
  debugMode: boolean;
};

export type GuardState = {
  status: GuardStatus;
  locationStarted: boolean;
  foregroundPermission: PermissionState;
  backgroundPermission: PermissionState;
  notificationPermission: PermissionState;
  currentLocation: LocationPoint | null;
  anchorLocation: LocationPoint | null;
  stayStartedAt: number | null;
  stayingSince: number | null;
  movingDistanceMeters: number;
  lastNotificationAt: number | null;
  cooldownUntil: number | null;
  lastError: string | null;
};

export type LogKind =
  | 'stay-started'
  | 'stay-continued'
  | 'moving-started'
  | 'notification-sent'
  | 'cooldown-ended'
  | 'permission'
  | 'system';

export type GuardLog = {
  id: string;
  timestamp: number;
  kind: LogKind;
  title: string;
  detail?: string;
};

export type GuardSnapshot = {
  state: GuardState;
  settings: GuardSettings;
  logs: GuardLog[];
};
