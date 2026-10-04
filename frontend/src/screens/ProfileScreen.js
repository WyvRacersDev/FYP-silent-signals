import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../api';
import { useSettings } from '../theme';
import { Button } from '../components';

const KEY = 'ss_profile';
const EMPTY = { name: '', email: '', guardianName: '', guardianContact: '' };

function Field({ label, value, onChangeText, colors, fs, keyboardType, placeholder }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.sub, fontSize: fs - 3, fontWeight: '600' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.sub}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        style={{
          backgroundColor: colors.card, borderColor: colors.border, borderWidth: colors.hc ? 2 : 1,
          borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
          color: colors.text, fontSize: fs,
        }}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const [items, setItems] = useState([]);
  const [statsError, setStatsError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(KEY)
        .then((v) => v && setForm({ ...EMPTY, ...JSON.parse(v) }))
        .catch(() => {});
      getHistory()
        .then((d) => {
          setItems(Array.isArray(d) ? d : d.items || []);
          setStatsError(null);
        })
        .catch((e) => setStatsError(e.message));
    }, [])
  );

  const set = (k) => (v) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(form));
      setSaved(true);
    } catch (e) {
      setSaved(false);
    }
  };

  const words = items.reduce(
    (n, c) => n + (c.corrected_text || '').trim().split(/\s+/).filter(Boolean).length,
    0
  );
  const emotions = items.reduce((m, c) => {
    const e = c.emotion || 'neutral';
    m[e] = (m[e] || 0) + 1;
    return m;
  }, {});
  const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0];
  const last = items.length
    ? new Date(Math.max(...items.map((c) => new Date(c.created_at)))).toLocaleString()
    : '—';
  const initial = (form.name || '?').trim().charAt(0).toUpperCase();

  const stats = [
    ['Conversations', items.length],
    ['Words recognized', words],
    ['Top emotion', topEmotion || '—'],
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: colors.hc ? 2 : 0, borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 36, fontWeight: '800' }}>{initial}</Text>
        </View>
        <Text style={{ color: colors.text, fontSize: fs + 4, fontWeight: '800' }}>
          {form.name || 'Your profile'}
        </Text>
      </View>

      <Text style={{ color: colors.text, fontSize: fs + 1, fontWeight: '800', marginTop: 4 }}>Activity</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {stats.map(([label, value], i) => {
          const bg = i === 1 ? colors.danger : colors.primary;
          const fg = i === 1 ? colors.onDanger : colors.onPrimary;
          return (
            <View
              key={label}
              style={{
                flex: 1, backgroundColor: bg, borderRadius: 18, padding: 12,
                borderWidth: colors.hc ? 2 : 0, borderColor: colors.border,
              }}
            >
              <Text style={{ color: fg, fontSize: fs + 4, fontWeight: '800' }} numberOfLines={1}>
                {value}
              </Text>
              <Text style={{ color: fg, fontSize: fs - 4, opacity: 0.8 }}>{label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={{ color: colors.sub, fontSize: fs - 3 }}>Last activity: {last}</Text>
      {statsError ? (
        <Text style={{ color: colors.text, fontSize: fs - 2, fontWeight: '700' }}>
          Could not load activity: {statsError}
        </Text>
      ) : null}

      <Text style={{ color: colors.text, fontSize: fs + 1, fontWeight: '800', marginTop: 8 }}>Details</Text>
      <Field label="Name" value={form.name} onChangeText={set('name')} colors={colors} fs={fs} placeholder="Your name" />
      <Field
        label="Email" value={form.email} onChangeText={set('email')} colors={colors} fs={fs}
        keyboardType="email-address" placeholder="you@example.com"
      />

      <Text style={{ color: colors.text, fontSize: fs + 1, fontWeight: '800', marginTop: 8 }}>Guardian</Text>
      <Field
        label="Guardian name" value={form.guardianName} onChangeText={set('guardianName')}
        colors={colors} fs={fs} placeholder="Family member or guardian"
      />
      <Field
        label="Guardian contact" value={form.guardianContact} onChangeText={set('guardianContact')}
        colors={colors} fs={fs} keyboardType="email-address" placeholder="Email or phone"
      />

      <Button title={saved ? 'Saved' : 'Save profile'} icon={saved ? 'checkmark' : 'save'} onPress={save} />
    </ScrollView>
  );
}
