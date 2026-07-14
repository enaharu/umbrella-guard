import * as BackgroundTask from 'expo-background-task';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { BACKGROUND_TASK_NAME, LOCATION_TASK_NAME } from '../constants/config';
import { addLog } from './storage';
import { processLocationPoint } from './tracker';
import { toPoint } from './locationService';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    await addLog({ kind: 'system', title: '位置情報タスクエラー', detail: error.message });
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] })?.locations ?? [];
  for (const location of locations) {
    await processLocationPoint(toPoint(location), true);
  }
});

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const location = await Location.getLastKnownPositionAsync({
      maxAge: 15 * 60 * 1000,
      requiredAccuracy: 500,
    });

    if (!location) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await processLocationPoint(toPoint(location), true);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    await addLog({
      kind: 'system',
      title: 'バックグラウンド確認エラー',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
