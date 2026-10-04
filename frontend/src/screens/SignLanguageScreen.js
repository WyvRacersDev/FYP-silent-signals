import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { signRead } from '../api';
import { useSettings } from '../theme';
import { Button } from '../components';

const MAX_SECONDS = 6;

export default function SignLanguageScreen() {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  if (!permission.granted) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text, fontSize: fs, textAlign: 'center', marginBottom: 16 }}>
          Camera access is needed to read signs.
        </Text>
        <Button title="Grant camera access" icon="camera" onPress={requestPermission} />
      </View>
    );
  }

  const submit = async (uri) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await signRead(uri));
    } catch (e) {
      setError(
        e.message.startsWith('404')
          ? 'The sign language model is not connected to the backend yet.'
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const record = async () => {
    if (!camRef.current || !ready) return;
    setResult(null);
    setError(null);
    setRecording(true);
    try {
      const video = await camRef.current.recordAsync({ maxDuration: MAX_SECONDS });
      setRecording(false);
      if (video?.uri) await submit(video.uri);
    } catch (e) {
      setRecording(false);
      setError(e.message);
    }
  };

  const stop = () => camRef.current?.stopRecording();
  const text = result ? result.corrected_text || result.raw_text : '';

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 16, gap: 14 }}
    >
      <View style={[s.cameraWrap, { borderColor: colors.border }]}>
        <CameraView
          ref={camRef}
          style={s.camera}
          facing="front"
          mode="video"
          mute
          onCameraReady={() => setReady(true)}
        />
        {recording && (
          <View style={[s.recBadge, { backgroundColor: colors.danger }]}>
            <Text style={{ color: colors.onDanger, fontWeight: '800' }}>● REC</Text>
          </View>
        )}
      </View>

      <Text style={{ color: colors.sub, fontSize: fs - 3, textAlign: 'center' }}>
        Keep both hands and your upper body in frame, up to {MAX_SECONDS}s.
      </Text>

      {recording ? (
        <Button title="Stop & translate" icon="stop-circle" danger onPress={stop} />
      ) : (
        <Button
          title="Record sign"
          icon="hand-left"
          onPress={record}
          disabled={!ready || loading}
        />
      )}

      {loading && (
        <View style={s.row}>
          <ActivityIndicator color={colors.text} />
          <Text style={{ color: colors.text, fontSize: fs }}>Reading signs…</Text>
        </View>
      )}

      {error && (
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '700' }}>{error}</Text>
      )}

      {result && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.sub, fontSize: fs - 3 }}>Translated</Text>
          <Text style={{ color: colors.text, fontSize: fs + 4, fontWeight: '700' }}>
            {text || '(nothing detected)'}
          </Text>
          <Button
            title="Speak"
            icon="volume-high"
            disabled={!text}
            onPress={() => Speech.speak(text)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  cameraWrap: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, height: 340 },
  camera: { flex: 1 },
  recBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 10 },
});
