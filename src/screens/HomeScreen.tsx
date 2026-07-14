import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { Icon } from '../components/Icon';
import { InfoCard } from '../components/InfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusRow } from '../components/StatusRow';
import { bottomNavHeight, colors } from '../constants/theme';
import { AppScreen } from '../constants/types';
import { useConditionalScroll } from '../hooks/useConditionalScroll';
import { UmbrellaGuardController } from '../hooks/useUmbrellaGuard';
import { formatMinutes, formatTime } from '../services/format';
import { getStayDurationMs } from '../services/tracker';

type HomeScreenProps = {
  guard: UmbrellaGuardController;
  onNavigate: (screen: AppScreen) => void;
};

export function HomeScreen({ guard, onNavigate }: HomeScreenProps) {
  const [now, setNow] = useState<number | null>(null);
  const scroll = useConditionalScroll({
    contentBottomPadding: bottomNavHeight + 28,
    coveredBottomHeight: bottomNavHeight,
  });
  const isEnabled = guard.settings.enabled;
  const stayMinutes = isEnabled ? formatMinutes(getStayDurationMs(guard.state)) : '--';
  const locationLabel = !isEnabled ? '停止中' : guard.state.locationStarted ? guard.statusLabel : '準備中';
  const locationPermissionIssue =
    isEnabled &&
    (guard.state.foregroundPermission === 'denied' || guard.state.backgroundPermission === 'denied');
  const notificationPermissionIssue = isEnabled && guard.state.notificationPermission === 'denied';
  const hasPermissionIssue = locationPermissionIssue || notificationPermissionIssue;
  const nextNotificationLabel = guard.state.cooldownUntil && now
    ? `${Math.max(0, Math.ceil((guard.state.cooldownUntil - now) / 60_000))}分`
    : '--';

  useEffect(() => {
    const updateNow = () => {
      setNow(Date.now());
    };
    updateNow();
    const interval = setInterval(updateNow, 15_000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setNow(Date.now());
    await guard.refresh();
  };

  return (
    <View style={styles.root}>
      <AppHeader title="傘おかん" centerBrand onNavigate={onNavigate} />
      <ScrollView
        {...scroll}
        contentContainerStyle={styles.content}
        style={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.umbrellaCircle}>
            <Icon ios="umbrella.fill" android="umbrella" color={colors.primary} size={58} />
            <View style={styles.drop}>
              <Icon ios="drop.fill" android="water_drop" color="#9cc8f8" size={18} />
            </View>
          </View>
          <Text style={styles.heroTitle}>傘忘れてない？</Text>
        </View>

        <InfoCard style={styles.switchCard}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>傘忘れ通知</Text>
            <Text style={styles.switchHelp}>
              {isEnabled ? '滞在と移動を見守っています' : '位置情報の監視と通知を停止しています'}
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={(enabled) => guard.updateSettings({ enabled })}
            trackColor={{ false: '#dbe6f3', true: colors.primary }}
            thumbColor="#ffffff"
          />
        </InfoCard>

        <InfoCard style={styles.statusCard}>
          <StatusRow
            ios="location.fill"
            android="location_on"
            label="現在の状態"
            value={locationLabel}
            badge={isEnabled ? `${stayMinutes}分経過` : 'OFF'}
          />
          <View style={styles.separator} />
          <StatusRow
            ios="clock"
            android="schedule"
            label="最終通知"
            value={formatTime(guard.state.lastNotificationAt)}
            onPress={() => onNavigate('logs')}
          />
          <View style={styles.separator} />
          <StatusRow
            ios="bell"
            android="notifications"
            label="次回通知まで"
            value={nextNotificationLabel}
            onPress={() => onNavigate('settings')}
          />
        </InfoCard>

        {hasPermissionIssue ? (
          <InfoCard style={styles.warningCard}>
            <Text style={styles.warningTitle}>設定アプリで許可してください</Text>
            <Text style={styles.warningText}>未許可の項目があります。次の項目を許可してください。</Text>
            <View style={styles.permissionList}>
              {locationPermissionIssue ? (
                <PermissionInstruction
                  title="位置情報の許可が必要です"
                  detail="［設定］＞［プライバシーとセキュリティ］＞［位置情報サービス］＞［傘おかん］を選択し、「常に」を選択してください。"
                />
              ) : null}
              {notificationPermissionIssue ? (
                <PermissionInstruction
                  title="通知の許可が必要です"
                  detail="［設定］＞［通知］＞［傘おかん］を選択し、「通知を許可」をONにしてください。"
                />
              ) : null}
            </View>
          </InfoCard>
        ) : null}

        <PrimaryButton
          label="状態を更新"
          ios="arrow.clockwise"
          android="refresh"
          variant="outline"
          onPress={handleRefresh}
        />
        <PrimaryButton
          label="通知テスト"
          ios="bell.fill"
          android="notifications"
          onPress={guard.sendTestNotification}
        />
      </ScrollView>
    </View>
  );
}

function PermissionInstruction({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.permissionItem}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: bottomNavHeight + 28,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 2,
  },
  umbrellaCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#2e5fa7',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  drop: {
    position: 'absolute',
    right: 30,
    bottom: 31,
  },
  heroTitle: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  statusCard: {
    overflow: 'hidden',
  },
  switchCard: {
    minHeight: 82,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  switchHelp: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
    backgroundColor: colors.border,
  },
  warningCard: {
    padding: 14,
    gap: 6,
    borderColor: '#fde7bd',
    backgroundColor: '#fffaf0',
  },
  warningTitle: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '900',
  },
  warningText: {
    color: '#8a5a12',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  permissionList: {
    gap: 8,
    marginTop: 4,
  },
  permissionItem: {
    gap: 3,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  permissionDetail: {
    color: '#8a5a12',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
