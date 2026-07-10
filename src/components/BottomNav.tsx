import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen } from '../constants/types';
import { bottomNavHeight, colors } from '../constants/theme';
import { Icon } from './Icon';

type NavItem = {
  screen: AppScreen;
  label: string;
  ios: string;
  android: string;
};

const items: NavItem[] = [
  { screen: 'home', label: 'ホーム', ios: 'house.fill', android: 'home' },
  { screen: 'logs', label: 'ログ', ios: 'list.bullet.rectangle', android: 'list_alt' },
  { screen: 'settings', label: '設定', ios: 'gearshape.fill', android: 'settings' },
];

type BottomNavProps = {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
};

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const active = activeScreen === item.screen;
        const tint = active ? colors.primary : '#7890aa';
        return (
          <Pressable
            key={item.screen}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onNavigate(item.screen)}
            style={styles.item}>
            <Icon ios={item.ios} android={item.android} color={tint} size={24} />
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: bottomNavHeight,
    paddingTop: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  item: {
    width: 76,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#7890aa',
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.primary,
  },
});
