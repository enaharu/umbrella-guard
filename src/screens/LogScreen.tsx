import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { Icon } from '../components/Icon';
import { InfoCard } from '../components/InfoCard';
import { bottomNavHeight, colors } from '../constants/theme';
import { AppScreen, GuardLog } from '../constants/types';
import { UmbrellaGuardController } from '../hooks/useUmbrellaGuard';
import { formatDateLabel, formatTime } from '../services/format';

type LogScreenProps = {
  guard: UmbrellaGuardController;
  onNavigate: (screen: AppScreen) => void;
};

const iconByKind: Record<GuardLog['kind'], { ios: string; android: string }> = {
  'stay-started': { ios: 'mappin.circle.fill', android: 'location_on' },
  'stay-continued': { ios: 'clock', android: 'schedule' },
  'moving-started': { ios: 'figure.walk', android: 'directions_walk' },
  'notification-sent': { ios: 'bell.fill', android: 'notifications' },
  'cooldown-ended': { ios: 'checkmark.circle.fill', android: 'task_alt' },
  permission: { ios: 'location.fill', android: 'location_on' },
  system: { ios: 'info.circle.fill', android: 'info' },
};

export function LogScreen({ guard, onNavigate }: LogScreenProps) {
  const logs = guard.logs;
  const dateLabel = logs[0]?.timestamp ? formatDateLabel(logs[0].timestamp) : formatDateLabel(Date.now());

  return (
    <View style={styles.root}>
      <AppHeader title="ログ" onNavigate={onNavigate} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.date}>{dateLabel}</Text>
        <InfoCard style={styles.card}>
          {logs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>ログはまだありません</Text>
              <Text style={styles.emptyText}>滞在や通知が検知されるとここに表示されます</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <LogItem key={log.id} log={log} isLast={index === logs.length - 1} />
            ))
          )}
        </InfoCard>
      </ScrollView>
    </View>
  );
}

function LogItem({ log, isLast }: { log: GuardLog; isLast: boolean }) {
  const icon = iconByKind[log.kind] ?? iconByKind.system;

  return (
    <View style={styles.logRow}>
      <View style={styles.timeline}>
        <View style={styles.iconCircle}>
          <Icon ios={icon.ios} android={icon.android} color={colors.primary} size={24} />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.logBody}>
        <Text style={styles.time}>{formatTime(log.timestamp)}</Text>
        <Text style={styles.title}>{log.title}</Text>
        {log.detail ? <Text style={styles.detail}>{log.detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: bottomNavHeight + 28,
  },
  date: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
  },
  card: {
    paddingVertical: 14,
  },
  logRow: {
    minHeight: 88,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  timeline: {
    width: 38,
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
    backgroundColor: colors.line,
  },
  logBody: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 18,
  },
  time: {
    color: '#345a85',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  detail: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
    lineHeight: 18,
  },
  empty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
