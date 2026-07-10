import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../constants/theme';

type InfoCardProps = {
  children: ReactNode;
  style?: object;
};

export function InfoCard({ children, style }: InfoCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#edf3fb',
    shadowColor: '#2e5fa7',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
