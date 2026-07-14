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
  { screen: 'logs', label: 'ログ', ios: 'list.bullet.rectangle', android: 'list_alt' },
  { screen: 'home', label: 'ホーム', ios: 'umbrella.fill', android: 'umbrella' },
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
        const isHome = item.screen === 'home';
        const tint = active ? colors.primary : '#7890aa';
        return (
          <Pressable
            key={item.screen}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onNavigate(item.screen)}
            style={({ pressed }) => [
              styles.item,
              isHome ? styles.homeItem : styles.sideItem,
              pressed && styles.pressed,
            ]}>
            {isHome ? (
              <View style={[styles.homeCircle, active && styles.activeHomeCircle]}>
                <Icon ios={item.ios} android={item.android} color="#ffffff" size={31} />
              </View>
            ) : (
              <Icon ios={item.ios} android={item.android} color={tint} size={24} />
            )}
            <Text style={[styles.label, active && styles.activeLabel, isHome && styles.homeLabel]}>
              {item.label}
            </Text>
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
    paddingTop: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  item: {
    width: 82,
    alignItems: 'center',
    gap: 4,
  },
  sideItem: {
    paddingTop: 10,
  },
  homeItem: {
    width: 96,
    marginTop: -20,
  },
  homeCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  activeHomeCircle: {
    backgroundColor: colors.primaryDark,
  },
  pressed: {
    opacity: 0.76,
  },
  label: {
    fontSize: 11,
    color: '#7890aa',
    fontWeight: '600',
  },
  homeLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  activeLabel: {
    color: colors.primary,
  },
});
