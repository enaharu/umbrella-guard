import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../constants/theme';
import { Icon } from './Icon';

type PrimaryButtonProps = {
  label: string;
  ios: string;
  android: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({ label, ios, android, onPress, variant = 'filled', style }: PrimaryButtonProps) {
  const filled = variant === 'filled';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? styles.filled : styles.outline,
        pressed && styles.pressed,
        style,
      ]}>
      <Icon ios={ios} android={android} size={19} color={filled ? '#ffffff' : colors.primary} />
      <Text style={[styles.label, filled ? styles.filledLabel : styles.outlineLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1.2,
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
  filledLabel: {
    color: '#ffffff',
  },
  outlineLabel: {
    color: colors.primary,
  },
});
