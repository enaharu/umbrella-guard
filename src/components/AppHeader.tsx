import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { AppScreen } from '../constants/types';
import { Icon } from './Icon';

type AppHeaderProps = {
  title: string;
  centerBrand?: boolean;
  onNavigate: (screen: AppScreen) => void;
};

export function AppHeader({ title, centerBrand = false, onNavigate }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      {centerBrand ? (
        <View style={styles.iconButton} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ホーム"
          onPress={() => onNavigate('home')}
          style={styles.iconButton}>
          <Icon ios="chevron.left" android="arrow_back" />
        </Pressable>
      )}
      <View style={styles.titleWrap}>
        {centerBrand ? <Icon ios="umbrella.fill" android="umbrella" size={17} color={colors.primary} /> : null}
        <Text style={[styles.title, centerBrand && styles.brandTitle]}>{title}</Text>
      </View>
      <View style={styles.iconButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 86,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 15,
  },
});
