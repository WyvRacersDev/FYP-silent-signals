import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useSettings } from '../theme';
import { Button } from '../components';

const PHRASES = [
  'Hello',
  'Thank you',
  'Please repeat that',
  'I cannot hear you',
  'Please speak slowly',
  'Where is the washroom?',
  'I need water',
  'Yes',
  'No',
];
const RATES = [['Slow', 0.7], ['Normal', 1], ['Fast', 1.3]];
const PITCHES = [['Low', 0.8], ['Normal', 1], ['High', 1.25]];

function Segment({ options, value, onChange, colors, fs }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map(([label, v]) => {
        const on = v === value;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => onChange(v)}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
              backgroundColor: on ? colors.primary : colors.card,
              borderWidth: on && !colors.hc ? 0 : colors.hc ? 2 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: on ? colors.onPrimary : colors.text, fontSize: fs - 1, fontWeight: '700' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TextToSpeechScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [recent, setRecent] = useState([]);

  useEffect(() => () => Speech.stop(), []);

  const speak = (value) => {
    const msg = (value ?? text).trim();
    if (!msg) return;
    Speech.stop();
    setSpeaking(true);
    Speech.speak(msg, {
      language: 'en-US',
      rate,
      pitch,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    setRecent((r) => [msg, ...r.filter((x) => x !== msg)].slice(0, 8));
  };

  const stop = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const label = { color: colors.sub, fontSize: fs - 3, fontWeight: '600' };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type what you want to say…"
        placeholderTextColor={colors.sub}
        multiline
        textAlignVertical="top"
        style={{
          minHeight: 140, backgroundColor: colors.card, borderColor: colors.border,
          borderWidth: colors.hc ? 2 : 1, borderRadius: 20, padding: 16,
          color: colors.text, fontSize: fs + 4,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          title={speaking ? 'Speaking…' : 'Speak'}
          icon="volume-high"
          style={{ flex: 2 }}
          disabled={!text.trim()}
          onPress={() => speak()}
        />
        <Button title="Stop" icon="stop-circle" danger style={{ flex: 1 }} disabled={!speaking} onPress={stop} />
      </View>
      {text ? (
        <TouchableOpacity onPress={() => setText('')}>
          <Text style={{ color: colors.sub, fontSize: fs - 2, textAlign: 'center' }}>Clear text</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={label}>QUICK PHRASES</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PHRASES.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => {
              setText(p);
              speak(p);
            }}
            style={{
              backgroundColor: colors.primary, borderRadius: 999,
              paddingHorizontal: 14, paddingVertical: 8,
              borderWidth: colors.hc ? 2 : 0, borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.onPrimary, fontSize: fs - 1, fontWeight: '700' }}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={label}>SPEED</Text>
      <Segment options={RATES} value={rate} onChange={setRate} colors={colors} fs={fs} />
      <Text style={label}>PITCH</Text>
      <Segment options={PITCHES} value={pitch} onChange={setPitch} colors={colors} fs={fs} />

      {recent.length ? (
        <>
          <Text style={label}>RECENTLY SPOKEN</Text>
          {recent.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => {
                setText(r);
                speak(r);
              }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1,
                borderRadius: 14, padding: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: fs, flex: 1 }} numberOfLines={2}>{r}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
