import './src/services/backgroundTasks';

import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNav } from './src/components/BottomNav';
import { AppScreen } from './src/constants/types';
import { useUmbrellaGuard } from './src/hooks/useUmbrellaGuard';
import { HomeScreen } from './src/screens/HomeScreen';
import { LogScreen } from './src/screens/LogScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const guard = useUmbrellaGuard();
  const [screen, setScreen] = useState<AppScreen>('home');

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'home' && <HomeScreen guard={guard} onNavigate={setScreen} />}
      {screen === 'logs' && <LogScreen guard={guard} onNavigate={setScreen} />}
      {screen === 'settings' && <SettingsScreen guard={guard} onNavigate={setScreen} />}
      <BottomNav activeScreen={screen} onNavigate={setScreen} />
    </SafeAreaProvider>
  );
}
