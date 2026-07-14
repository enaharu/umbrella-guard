import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, DEFAULT_STATE } from '../constants/config';
import { GuardLog, GuardSettings, GuardSnapshot, GuardState } from '../constants/types';

const STATE_KEY = 'umbrella-guard:state';
const SETTINGS_KEY = 'umbrella-guard:settings';
const LOGS_KEY = 'umbrella-guard:logs';
const MAX_LOGS = 20;

function parseStoredJson<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function loadState(): Promise<GuardState> {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  return { ...DEFAULT_STATE, ...parseStoredJson<Partial<GuardState>>(raw, {}) };
}

export async function saveState(state: GuardState) {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export async function loadSettings(): Promise<GuardSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...parseStoredJson<Partial<GuardSettings>>(raw, {}) };
}

export async function saveSettings(settings: GuardSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadLogs(): Promise<GuardLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  const logs = parseStoredJson<GuardLog[]>(raw, []);
  return Array.isArray(logs) ? logs.slice(0, MAX_LOGS) : [];
}

export async function saveLogs(logs: GuardLog[]) {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
}

export async function addLog(entry: Omit<GuardLog, 'id' | 'timestamp'>, timestamp = Date.now()) {
  const logs = await loadLogs();
  const nextLogs: GuardLog[] = [
    {
      id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp,
      ...entry,
    },
    ...logs,
  ].slice(0, MAX_LOGS);
  await saveLogs(nextLogs);
  return nextLogs;
}

export async function loadSnapshot(): Promise<GuardSnapshot> {
  const [state, settings, logs] = await Promise.all([loadState(), loadSettings(), loadLogs()]);
  return { state, settings, logs };
}
