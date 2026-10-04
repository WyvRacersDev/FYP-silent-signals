import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { lipread } from '../api';
import { useSettings } from '../theme';
import { Button } from '../components';

const MAX_SECONDS = 5;
const LOW_CONF = 0.6;

export default function LipReadScreen() {
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
          Camera access is needed to read lips.
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
      setResult(await lipread(uri));
    } catch (e) {
      setError(e.message);
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

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });
    if (!res.canceled && res.assets?.[0]?.uri) await submit(res.assets[0].uri);
  };

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
        Face the camera, speak silently, up to {MAX_SECONDS}s.
      </Text>

      {recording ? (
        <Button title="Stop & read" icon="stop-circle" danger onPress={stop} />
      ) : (
        <Button
          title="Record"
          icon="radio-button-on"
          onPress={record}
          disabled={!ready || loading}
        />
      )}
      <Button
        title="Pick a video"
        icon="images"
        danger
        onPress={pick}
        disabled={recording || loading}
      />

      {loading && (
        <View style={s.row}>
          <ActivityIndicator color={colors.text} />
          <Text style={{ color: colors.text, fontSize: fs }}>Reading lips…</Text>
        </View>
      )}

      {error && (
        <Text style={{ color: colors.text, fontSize: fs, fontWeight: '700' }}>Error: {error}</Text>
      )}

      {result && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.sub, fontSize: fs - 3 }}>Recognized</Text>
          <Text style={{ color: colors.text, fontSize: fs + 4, fontWeight: '700' }}>
            {text || '(nothing detected)'}
          </Text>
          {result.raw_text && result.raw_text !== result.corrected_text ? (
            <Text style={{ color: colors.sub, fontSize: fs - 2 }}>Raw: {result.raw_text}</Text>
          ) : null}

          <View style={s.chips}>
            {(result.words || []).map((w, i) => {
              const low = w.confidence < LOW_CONF;
              return (
                <View
                  key={i}
                  style={[
                    s.chip,
                    {
                      backgroundColor: low ? colors.danger : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: low ? colors.onDanger : colors.onPrimary,
                      fontSize: fs - 1,
                      fontWeight: low ? '800' : '600',
                    }}
                  >
                    {w.text} · {Math.round(w.confidence * 100)}%
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={{ color: colors.sub, fontSize: fs - 3 }}>
            Dark chips = low confidence ({'<'} {Math.round(LOW_CONF * 100)}%)
          </Text>

          <Text style={{ color: colors.sub, fontSize: fs - 2 }}>
            Emotion: {result.emotion || 'neutral'}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
});
