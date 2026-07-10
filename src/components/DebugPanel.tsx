import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { UmbrellaGuardController } from '../hooks/useUmbrellaGuard';
import { formatCoordinate, formatMinutes } from '../services/format';
import { getNextCondition, getStayDurationMs } from '../services/tracker';
import { InfoCard } from './InfoCard';

type DebugPanelProps = {
  guard: UmbrellaGuardController;
};

export function DebugPanel({ guard }: DebugPanelProps) {
  if (!guard.settings.debugMode) {
    return null;
  }

  const current = guard.state.currentLocation;
  const stayMinutes = formatMinutes(getStayDurationMs(guard.state));
  const nextCondition = getNextCondition(guard.state, guard.settings);

  return (
    <InfoCard style={styles.card}>
      <Text style={styles.title}>デバッグモード</Text>
      <View style={styles.grid}>
        <DebugItem label="緯度" value={formatCoordinate(current?.latitude)} />
        <DebugItem label="経度" value={formatCoordinate(current?.longitude)} />
        <DebugItem label="滞在時間" value={`${stayMinutes}分`} />
        <DebugItem label="移動距離" value={`${guard.state.movingDistanceMeters}m`} />
        <DebugItem label="現在状態" value={guard.state.status} />
        <DebugItem label="次回条件" value={nextCondition} wide />
      </View>
    </InfoCard>
  );
}

function DebugItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.item, wide && styles.wideItem]}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '48%',
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  wideItem: {
    width: '100%',
  },
  itemLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
