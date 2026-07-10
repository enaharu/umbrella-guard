import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { Icon } from './Icon';

type StatusRowProps = {
  ios: string;
  android: string;
  label: string;
  value: string;
  badge?: string;
  onPress?: () => void;
};

export function StatusRow({ ios, android, label, value, badge, onPress }: StatusRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container onPress={onPress} style={styles.row}>
      <Icon ios={ios} android={android} color="#55718f" size={22} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {onPress ? <Icon ios="chevron.right" android="arrow_forward_ios" color="#55718f" size={16} /> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  value: {
    maxWidth: 112,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    minWidth: 64,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
