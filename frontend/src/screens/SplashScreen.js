import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLUE, BEIGE, BLACK } from '../theme';

const DOTS = 5;
const LOOP_MS = 5200;

// Animated 0..1 value that pulses at each given phase peak.
function pulses(phase, peaks, w = 0.07) {
  const pts = [[0, 0]];
  peaks.forEach((pk) => {
    [[pk - w, 0], [pk, 1], [pk + w, 0]].forEach(([x, y]) => {
      const last = pts[pts.length - 1][0];
      pts.push([Math.max(x, last + 0.0001), y]);
    });
  });
  pts.push([1, 0]);
  return phase.interpolate({
    inputRange: pts.map((p) => p[0]),
    outputRange: pts.map((p) => p[1]),
    extrapolate: 'clamp',
  });
}

function Person({ mouth, bob, look, skin, hair, shirt }) {
  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ translateY: bob }] }}>
      <View style={[s.head, { backgroundColor: skin }]}>
        <View style={[s.hair, { backgroundColor: hair }]} />
        <View style={[s.eyes, { transform: [{ translateX: look }] }]}>
          <View style={s.eye} />
          <View style={s.eye} />
        </View>
        <Animated.View style={[s.mouth, { transform: [{ translateX: look }, { scaleY: mouth }] }]} />
      </View>
      <View style={[s.torso, { backgroundColor: shirt }]} />
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const phase = useRef(new Animated.Value(0)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const btnIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: LOOP_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    Animated.timing(titleIn, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }).start();
    Animated.timing(btnIn, { toValue: 1, duration: 600, delay: 1800, useNativeDriver: true }).start();
    const timer = setTimeout(() => navigation.replace('Dashboard'), 7000);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, []);

  // Left person talks in the first half, right person in the second half.
  const leftMouth = phase.interpolate({
    inputRange: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 1],
    outputRange: [0.25, 1, 0.3, 1, 0.3, 0.25, 0.25],
  });
  const rightMouth = phase.interpolate({
    inputRange: [0, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 1],
    outputRange: [0.25, 0.25, 1, 0.3, 1, 0.3, 0.25, 0.25],
  });
  const bob = phase.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -4, 0, -4, 0],
  });

  const dots = Array.from({ length: DOTS }, (_, i) => {
    const p = i / (DOTS - 1);
    const op = pulses(phase, [0.1 + 0.32 * p, 0.6 + 0.32 * (1 - p)]);
    return {
      opacity: op.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }),
      scale: op.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.5] }),
    };
  });

  return (
    <LinearGradient colors={[BLACK, '#10141A', '#2E3946']} style={s.root}>
      <View style={[s.blob, { top: -80, right: -90, backgroundColor: 'rgba(126,144,164,0.16)' }]} />
      <View style={[s.blob, { bottom: -120, left: -100, backgroundColor: 'rgba(208,205,197,0.07)' }]} />

      <View style={s.stage}>
        <Person mouth={leftMouth} bob={bob} look={4} skin="#E3C9B0" hair="#0A0A0A" shirt={BLUE} />
        <View style={s.dotsRow}>
          {dots.map((d, i) => (
            <Animated.View
              key={i}
              style={[s.dot, { opacity: d.opacity, transform: [{ scale: d.scale }] }]}
            />
          ))}
        </View>
        <Person mouth={rightMouth} bob={bob} look={-4} skin="#B98E6E" hair="#2A2420" shirt={BEIGE} />
      </View>

      <Animated.View
        style={{
          alignItems: 'center',
          marginTop: 44,
          opacity: titleIn,
          transform: [{ translateY: titleIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}
      >
        <Text style={s.title}>
          Silent <Text style={{ color: BLUE }}>Signals</Text>
        </Text>
        <Text style={s.tag}>Speak without sound</Text>
      </Animated.View>

      <Animated.View style={[s.btnWrap, { bottom: insets.bottom + 32, opacity: btnIn }]}>
        <TouchableOpacity style={s.btn} onPress={() => navigation.replace('Dashboard')}>
          <Text style={s.btnText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  stage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  head: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', alignItems: 'center' },
  hair: { position: 'absolute', top: 0, left: 0, right: 0, height: 28 },
  eyes: { position: 'absolute', top: 38, flexDirection: 'row', gap: 16 },
  eye: { width: 8, height: 8, borderRadius: 4, backgroundColor: BLACK },
  mouth: {
    position: 'absolute', top: 54, width: 22, height: 12, borderRadius: 6,
    backgroundColor: '#3A1F1F',
  },
  torso: {
    width: 112, height: 64, marginTop: 3,
    borderTopLeftRadius: 56, borderTopRightRadius: 56,
  },
  dotsRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
    marginBottom: 56,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BEIGE },
  title: { color: BEIGE, fontSize: 38, fontWeight: '800', letterSpacing: 0.5 },
  tag: { color: BLUE, fontSize: 16, marginTop: 6, letterSpacing: 1 },
  btnWrap: { position: 'absolute', left: 24, right: 24 },
  btn: { backgroundColor: BEIGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: BLACK, fontSize: 17, fontWeight: '700' },
});
