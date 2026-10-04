import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { sendEmergency } from '../api';
import { useSettings } from '../theme';
import { Button } from '../components';

const PHRASES = [
  'I need help',
  'Call my family',
  'I am feeling sick',
  'I am in pain',
];

export default function EmergencyScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const [active, setActive] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const failed = status.startsWith('Could');

  const trigger = async (phrase) => {
    setActive(phrase);
    setStatus('');
    setBusy(true);
    Speech.stop();
    Speech.speak(phrase);
    try {
      await sendEmergency(phrase);
      setStatus('Guardian notified');
    } catch (e) {
      setStatus(`Could not notify guardian: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 12 }}
    >
      <Text style={{ color: colors.sub, fontSize: fs - 1 }}>
        Tap a phrase: it is spoken aloud and your guardian is notified.
      </Text>

      {active ? (
        <View
          style={{
            backgroundColor: colors.card, borderWidth: 2, borderColor: colors.text,
            borderRadius: 22, padding: 22, alignItems: 'center', gap: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: fs + 14, fontWeight: '800', textAlign: 'center' }}>
            {active}
          </Text>
          <Text style={{ color: colors.text, fontSize: fs - 1, fontWeight: failed ? '800' : '500' }}>
            {busy ? 'Notifying guardian…' : status}
          </Text>
        </View>
      ) : null}

      {PHRASES.map((p) => (
        <Button
          key={p}
          title={p}
          icon="alert-circle"
          danger
          disabled={busy}
          onPress={() => trigger(p)}
          style={{ paddingVertical: 22, borderRadius: 20 }}
        />
      ))}
    </ScrollView>
  );
}
