import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { DebugPanel } from '../components/DebugPanel';
import { Icon } from '../components/Icon';
import { InfoCard } from '../components/InfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusRow } from '../components/StatusRow';
import { bottomNavHeight, colors } from '../constants/theme';
import { AppScreen } from '../constants/types';
import { UmbrellaGuardController } from '../hooks/useUmbrellaGuard';
import { formatMinutes, formatTime } from '../services/format';
import { getStayDurationMs } from '../services/tracker';

type HomeScreenProps = {
  guard: UmbrellaGuardController;
  onNavigate: (screen: AppScreen) => void;
};

export function HomeScreen({ guard, onNavigate }: HomeScreenProps) {
  const stayMinutes = formatMinutes(getStayDurationMs(guard.state));
  const locationLabel = guard.state.locationStarted ? guard.statusLabel : '準備中';
  const permissionIssue =
    guard.state.foregroundPermission === 'denied' || guard.state.backgroundPermission === 'denied';

  return (
    <View style={styles.root}>
      <AppHeader title="傘おかんアプリ" centerBrand onNavigate={onNavigate} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.umbrellaCircle}>
            <Icon ios="umbrella.fill" android="umbrella" color={colors.primary} size={82} />
            <View style={styles.drop}>
              <Icon ios="drop.fill" android="water_drop" color="#9cc8f8" size={24} />
            </View>
          </View>
          <Text style={styles.heroTitle}>傘忘れてない？</Text>
        </View>

        <InfoCard style={styles.statusCard}>
          <StatusRow
            ios="location.fill"
            android="location_on"
            label="現在の状態"
            value={locationLabel}
            badge={`${stayMinutes}分経過`}
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
            value={
              guard.state.cooldownUntil
                ? `${Math.max(0, Math.ceil((guard.state.cooldownUntil - Date.now()) / 60_000))}分`
                : '--'
            }
            onPress={() => onNavigate('settings')}
          />
        </InfoCard>

        {permissionIssue ? (
          <InfoCard style={styles.warningCard}>
            <Text style={styles.warningTitle}>位置情報権限が不足しています</Text>
            <Text style={styles.warningText}>
              Foreground と Background の両方が必要です。端末設定から位置情報を許可してください。
            </Text>
          </InfoCard>
        ) : null}

        {guard.state.lastError ? (
          <InfoCard style={styles.warningCard}>
            <Text style={styles.warningTitle}>システムメッセージ</Text>
            <Text style={styles.warningText}>{guard.state.lastError}</Text>
          </InfoCard>
        ) : null}

        <PrimaryButton
          label="通知テスト"
          ios="bell.fill"
          android="notifications"
          onPress={guard.sendTestNotification}
        />
        <PrimaryButton
          label="ログを表示"
          ios="list.bullet.rectangle"
          android="list_alt"
          variant="outline"
          onPress={() => onNavigate('logs')}
        />

        <DebugPanel guard={guard} />
      </ScrollView>
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
    paddingTop: 2,
    paddingBottom: 8,
  },
  umbrellaCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
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
    right: 43,
    bottom: 44,
  },
  heroTitle: {
    marginTop: 18,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  statusCard: {
    overflow: 'hidden',
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
});
