import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../api';
import { useSettings } from '../theme';

export default function HistoryScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      const list = Array.isArray(data) ? data : data.items || [];
      setItems([...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalWords = items.reduce(
    (n, c) => n + ((c.corrected_text || '').trim().split(/\s+/).filter(Boolean).length),
    0
  );

  const header = (
    <View style={{ gap: 10, marginBottom: 6 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          ['Conversations', items.length, colors.primary, colors.onPrimary],
          ['Words recognized', totalWords, colors.danger, colors.onDanger],
        ].map(([label, value, bg, fg]) => (
          <View
            key={label}
            style={{
              flex: 1, backgroundColor: bg, borderRadius: 20, padding: 14,
              borderWidth: colors.hc ? 2 : 0, borderColor: colors.border,
            }}
          >
            <Text style={{ color: fg, fontSize: fs + 10, fontWeight: '800' }}>{value}</Text>
            <Text style={{ color: fg, fontSize: fs - 3, opacity: 0.8 }}>{label}</Text>
          </View>
        ))}
      </View>
      {error ? (
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '700' }}>Error: {error}</Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 10 }}
      data={items}
      keyExtractor={(item, i) => String(item.id ?? i)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.text} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        !loading && !error ? (
          <Text style={{ color: colors.sub, fontSize: fs }}>No conversations yet.</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: colors.card, borderColor: colors.border,
            borderWidth: 1, borderRadius: 18, padding: 14, gap: 4,
          }}
        >
          <Text style={{ color: colors.sub, fontSize: fs - 3 }}>
            {new Date(item.created_at).toLocaleString()} · {item.emotion || 'neutral'}
          </Text>
          <Text style={{ color: colors.text, fontSize: fs + 1, fontWeight: '700' }}>
            {item.corrected_text || item.raw_text}
          </Text>
          {item.raw_text && item.raw_text !== item.corrected_text ? (
            <Text style={{ color: colors.sub, fontSize: fs - 2 }}>Raw: {item.raw_text}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
