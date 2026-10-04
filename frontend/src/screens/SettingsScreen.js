import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { health } from '../api';
import { API_URL } from '../config';
import { useSettings } from '../theme';
import { Button } from '../components';

export default function SettingsScreen() {
  const { settings, update, colors } = useSettings();
  const fs = settings.fontSize;
  const [conn, setConn] = useState('');

  const test = async () => {
    setConn('Checking…');
    try {
      const r = await health();
      setConn(`Connected (${r.status})`);
    } catch (e) {
      setConn(`Failed: ${e.message}`);
    }
  };

  const box = {
    backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1,
    borderRadius: 18, padding: 14,
  };

  const Row = ({ label, value, onChange }) => (
    <View style={[box, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
      <Text style={{ color: colors.text, fontSize: fs, fontWeight: '600' }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.text : colors.card}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 12 }}
    >
      <Row label="Dark mode" value={settings.darkMode} onChange={(v) => update({ darkMode: v })} />
      <Row
        label="High contrast"
        value={settings.highContrast}
        onChange={(v) => update({ highContrast: v })}
      />

      <View style={[box, { gap: 10 }]}>
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '600' }}>Font size: {fs}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            title="A−"
            style={{ flex: 1 }}
            disabled={fs <= 12}
            onPress={() => update({ fontSize: fs - 2 })}
          />
          <Button
            title="A+"
            style={{ flex: 1 }}
            disabled={fs >= 28}
            onPress={() => update({ fontSize: fs + 2 })}
          />
        </View>
      </View>

      <View style={[box, { gap: 10 }]}>
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '600' }}>Server</Text>
        <Text style={{ color: colors.sub, fontSize: fs - 3 }}>{API_URL}</Text>
        <Button title="Test connection" icon="wifi" onPress={test} />
        {conn ? (
          <Text
            style={{
              color: colors.text, fontSize: fs - 2,
              fontWeight: conn.startsWith('Failed') ? '800' : '500',
            }}
          >
            {conn}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
