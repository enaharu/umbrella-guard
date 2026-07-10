import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { InfoCard } from './InfoCard';

type SettingControlProps = {
  sectionTitle: string;
  title: string;
  value: number;
  unit: string;
  help: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export function SettingControl({
  sectionTitle,
  title,
  value,
  unit,
  help,
  min,
  max,
  step,
  onChange,
}: SettingControlProps) {
  const ratio = (value - min) / (max - min);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <InfoCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>
            {value}
            {unit}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
          <View style={[styles.thumb, { left: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
        </View>
        <View style={styles.buttons}>
          <Pressable style={styles.stepButton} onPress={() => onChange(Math.max(min, value - step))}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Pressable style={styles.stepButton} onPress={() => onChange(Math.min(max, value + step))}>
            <Text style={styles.stepText}>＋</Text>
          </Pressable>
        </View>
        <Text style={styles.help}>{help}</Text>
      </InfoCard>
    </View>
  );
}

export function DebugSwitch({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <InfoCard style={styles.switchCard}>
      <View>
        <Text style={styles.title}>デバッグモード</Text>
        <Text style={styles.help}>詳細な情報を表示します</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#dbe6f3', true: colors.primary }}
        thumbColor="#ffffff"
      />
    </InfoCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2eaf5',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    top: -8,
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d8e4f4',
    backgroundColor: '#ffffff',
    shadowColor: '#214c8a',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  stepButton: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  stepText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  help: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  switchCard: {
    padding: 16,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
