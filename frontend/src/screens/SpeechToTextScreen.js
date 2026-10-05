import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { transcribe } from '../api';
import { useSettings } from '../theme';
import { Button } from '../components';

export default function SpeechToTextScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [granted, setGranted] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const askPermission = () =>
    AudioModule.requestRecordingPermissionsAsync()
      .then((s) => setGranted(s.granted))
      .catch(() => setGranted(false));

  useEffect(() => {
    askPermission();
  }, []);

  useEffect(() => {
    if (!recording) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [recording]);

  const start = async () => {
    setError(null);
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const stop = async () => {
    setRecording(false);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = recorder.uri;
      if (!uri) throw new Error('No audio was recorded');
      setLoading(true);
      const res = await transcribe(uri);
      const text = (res.text || '').trim();
      setLines((l) => [
        { id: Date.now(), text: text || '(nothing heard)', time: new Date().toLocaleTimeString() },
        ...l,
      ]);
    } catch (e) {
      setError(
        e.message.startsWith('404')
          ? 'Speech-to-text is not set up on the backend yet.'
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (granted === null) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  if (!granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: fs, textAlign: 'center', marginBottom: 16 }}>
          Microphone access is needed to listen.
        </Text>
        <Button title="Grant microphone access" icon="mic" onPress={askPermission} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 24, gap: 16 }}
    >
      <View style={{ alignItems: 'center', gap: 14 }}>
        <View style={{ width: 130, height: 130, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              position: 'absolute', width: 120, height: 120, borderRadius: 60,
              backgroundColor: colors.primary, opacity: recording ? 0.3 : 0,
              transform: [{ scale: pulse }],
            }}
          />
          <TouchableOpacity
            accessibilityLabel={recording ? 'Stop listening' : 'Start listening'}
            disabled={loading}
            onPress={recording ? stop : start}
            style={{
              width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center',
              backgroundColor: recording ? colors.danger : colors.primary,
              borderWidth: colors.hc ? 2 : 0, borderColor: colors.border,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Ionicons
              name={recording ? 'stop' : 'mic'}
              size={42}
              color={recording ? colors.onDanger : colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '700' }}>
          {recording ? 'Listening… tap to stop' : loading ? 'Converting to text…' : 'Tap to listen'}
        </Text>
        <Text style={{ color: colors.sub, fontSize: fs - 3, textAlign: 'center' }}>
          Hold the phone near the speaker. Short clips work best.
        </Text>
        {loading ? <ActivityIndicator color={colors.text} /> : null}
      </View>

      {error ? (
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
      ) : null}

      {lines.map((l) => (
        <View
          key={l.id}
          style={{
            backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1,
            borderRadius: 20, padding: 16, gap: 6,
          }}
        >
          <Text style={{ color: colors.sub, fontSize: fs - 4 }}>{l.time}</Text>
          <Text style={{ color: colors.text, fontSize: fs + 6, fontWeight: '700' }}>{l.text}</Text>
        </View>
      ))}

      {lines.length ? (
        <Button title="Clear" icon="trash" danger onPress={() => setLines([])} />
      ) : null}
    </ScrollView>
  );
}
