import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { SettingControl } from '../components/SettingControl';
import { bottomNavHeight, colors } from '../constants/theme';
import { AppScreen } from '../constants/types';
import { useConditionalScroll } from '../hooks/useConditionalScroll';
import { UmbrellaGuardController } from '../hooks/useUmbrellaGuard';

type SettingsScreenProps = {
  guard: UmbrellaGuardController;
  onNavigate: (screen: AppScreen) => void;
};

export function SettingsScreen({ guard, onNavigate }: SettingsScreenProps) {
  const scroll = useConditionalScroll({
    contentBottomPadding: bottomNavHeight + 28,
    coveredBottomHeight: bottomNavHeight,
  });

  return (
    <View style={styles.root}>
      <AppHeader title="設定" onNavigate={onNavigate} />
      <ScrollView
        {...scroll}
        contentContainerStyle={styles.content}>
        <SettingControl
          sectionTitle="滞在判定の条件"
          title="滞在時間"
          value={guard.settings.stayDurationMinutes}
          unit="分"
          min={1}
          max={60}
          step={1}
          help="同じ場所にいると判定する時間"
          onChange={(stayDurationMinutes) => guard.updateSettings({ stayDurationMinutes })}
        />

        <SettingControl
          sectionTitle="移動判定の条件"
          title="移動距離"
          value={guard.settings.moveDistanceMeters}
          unit="m"
          min={100}
          max={1000}
          step={50}
          help="この距離以上移動すると移動開始と判定します"
          onChange={(moveDistanceMeters) => guard.updateSettings({ moveDistanceMeters })}
        />

        <SettingControl
          sectionTitle="通知のクールダウン"
          title="再通知までの時間"
          value={guard.settings.cooldownMinutes}
          unit="分"
          min={10}
          max={180}
          step={10}
          help="通知後、再度通知するまでの時間"
          onChange={(cooldownMinutes) => guard.updateSettings({ cooldownMinutes })}
        />

      </ScrollView>
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
    gap: 22,
  },
});
