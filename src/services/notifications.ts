import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { NOTIFICATION_CHANNEL_ID } from '../constants/config';

const TITLE = '☔ 傘忘れてない？';
const BODY = '傘や荷物の置き忘れがないか確認してください';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function prepareNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: '傘リマインダー',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2f73df',
  });
}

export async function requestNotificationPermission() {
  await prepareNotificationChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function isNotificationPermissionGranted() {
  await prepareNotificationChannel();
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted;
}

export async function sendUmbrellaNotification(reason: 'movement' | 'test' = 'movement') {
  await prepareNotificationChannel();

  if (!(await isNotificationPermissionGranted())) {
    throw new Error('通知が許可されていません。端末設定から通知を許可してください。');
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: TITLE,
      body: BODY,
      sound: 'default',
      data: { reason },
    },
    trigger: Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : null,
  });
}
