import { Text, TextStyle, ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';

type IconProps = {
  ios: string;
  android: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
  fallback?: string;
};

export function Icon({ ios, android, size = 22, color = '#2f73df', style, fallback }: IconProps) {
  return (
    <SymbolView
      name={{ ios: ios as never, android: android as never, web: android as never }}
      size={size}
      tintColor={color}
      style={style}
      fallback={<Text style={[{ color, fontSize: size, lineHeight: size } as TextStyle]}>{fallback ?? '•'}</Text>}
    />
  );
}
