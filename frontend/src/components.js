import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from './theme';

export function Button({ title, onPress, icon, disabled, danger, style }) {
  const { settings, colors } = useSettings();
  const bg = danger ? colors.danger : colors.primary;
  const fg = danger ? colors.onDanger : colors.onPrimary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: colors.hc ? 2 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={settings.fontSize + 4} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: settings.fontSize, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}
