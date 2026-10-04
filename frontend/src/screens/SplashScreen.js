import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, Easing, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLUE, BEIGE, BLACK } from '../theme';

const LOOP_MS = 6000;
const HEAD = 68;
const TORSO_W = 100;
const TOP_PAD = 34;
const MOUTH_Y = TOP_PAD + 56;
const PERSON_H = TOP_PAD + HEAD + 3 + 62;
const ARC_H = 38;
const ARC_W = 16;

const clampRange = (phase, input, output) =>
  phase.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' });

// One sound/signal wave travelling through the air between the two people.
function Arc({ phase, start, dur, dir, dist, color }) {
  const end = start + dur;
  const x = clampRange(phase, [start, end], dir > 0 ? [0, dist] : [0, -dist]);
  const opacity = clampRange(phase, [start, start + 0.04, end - 0.08, end], [0, 1, 0.6, 0]);
  const scaleY = clampRange(phase, [start, end], [0.6, 1.3]);
  return (
    <Animated.View
      style={[
        s.arc,
        dir > 0 ? { left: 0, borderRightWidth: 4 } : { right: 0, borderLeftWidth: 4 },
        { borderColor: color, opacity, transform: [{ translateX: x }, { scaleY }] },
      ]}
    />
  );
}

function Person({ mouth, bob, look, skin, hair, shirt, accessory, bubble, bubbleColor, bubbleSide }) {
  const shades = accessory === 'sunglasses';
  return (
    <Animated.View style={{ width: TORSO_W, alignItems: 'center', paddingTop: TOP_PAD, transform: [{ translateY: bob }] }}>
      {/* "talking" bubble */}
      <Animated.View
        style={[
          s.bubble,
          bubbleSide === 'right' ? { right: -8 } : { left: -8 },
          { backgroundColor: bubbleColor, opacity: bubble, transform: [{ scale: bubble }] },
        ]}
      >
        <View style={s.bubbleDot} />
        <View style={s.bubbleDot} />
        <View style={s.bubbleDot} />
      </Animated.View>

      {/* long hair sits behind the head */}
      {shades ? (
        <View style={[s.longHair, { backgroundColor: hair }]} />
      ) : null}

      <View style={{ width: HEAD, height: HEAD }}>
        <View style={[s.face, { backgroundColor: skin }]}>
          <View style={[s.hair, { backgroundColor: hair, height: shades ? 30 : 22 }]} />
          {shades ? (
            <View style={[s.shades, { transform: [{ translateX: look }] }]}>
              <View style={s.lens} />
              <View style={s.bridge} />
              <View style={s.lens} />
            </View>
          ) : (
            <View style={[s.eyes, { transform: [{ translateX: look }] }]}>
              <View style={s.eye} />
              <View style={s.eye} />
            </View>
          )}
          <Animated.View style={[s.mouth, { transform: [{ translateX: look }, { scaleY: mouth }] }]} />
        </View>

        {/* headphones */}
        {accessory === 'headphones' ? (
          <>
            <View style={s.band} />
            <View style={[s.cup, { left: -9 }]} />
            <View style={[s.cup, { right: -9 }]} />
          </>
        ) : null}
      </View>

      <View style={[s.torso, { backgroundColor: shirt }]} />

      {/* white cane */}
      {shades ? (
        <View style={s.cane}>
          <View style={[s.hand, { backgroundColor: skin }]} />
          <View style={s.caneTip} />
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const airW = Math.max(60, width - 48 - TORSO_W * 2);
  const dist = Math.max(30, airW - ARC_W);

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
    const timer = setTimeout(() => navigation.replace('Dashboard'), 8000);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, []);

  // Left person talks in the first half, right person answers in the second half.
  const leftMouth = phase.interpolate({
    inputRange: [0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 1],
    outputRange: [0.25, 1, 0.3, 1, 0.3, 0.9, 0.25, 0.25],
  });
  const rightMouth = phase.interpolate({
    inputRange: [0, 0.5, 0.57, 0.64, 0.71, 0.78, 0.85, 0.92, 1],
    outputRange: [0.25, 0.25, 1, 0.3, 1, 0.3, 0.9, 0.25, 0.25],
  });
  const leftBubble = phase.interpolate({
    inputRange: [0, 0.04, 0.46, 0.5, 1],
    outputRange: [0, 1, 1, 0, 0],
  });
  const rightBubble = phase.interpolate({
    inputRange: [0, 0.5, 0.54, 0.96, 1],
    outputRange: [0, 0, 1, 1, 0],
  });
  const bobL = phase.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -4, 0, -4, 0] });
  const bobR = phase.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [-3, 0, -3, 0, -3] });

  return (
    <LinearGradient colors={[BLACK, '#10141A', '#2E3946']} style={s.root}>
      <View style={[s.blob, { top: -80, right: -90, backgroundColor: 'rgba(126,144,164,0.16)' }]} />
      <View style={[s.blob, { bottom: -120, left: -100, backgroundColor: 'rgba(208,205,197,0.07)' }]} />

      <View style={s.stage}>
        {/* hearing-impaired: headphones / hearing device */}
        <Person
          mouth={leftMouth}
          bob={bobL}
          look={3}
          skin="#E3C9B0"
          hair="#0A0A0A"
          shirt={BLUE}
          accessory="headphones"
          bubble={leftBubble}
          bubbleColor={BEIGE}
          bubbleSide="right"
        />

        <View style={s.air}>
          {[0, 1, 2].map((i) => (
            <Arc key={`r${i}`} phase={phase} start={0.04 + 0.08 * i} dur={0.26} dir={1} dist={dist} color={BEIGE} />
          ))}
          {[0, 1, 2].map((i) => (
            <Arc key={`l${i}`} phase={phase} start={0.54 + 0.08 * i} dur={0.26} dir={-1} dist={dist} color={BLUE} />
          ))}
        </View>

        {/* visually impaired: dark glasses + white cane */}
        <Person
          mouth={rightMouth}
          bob={bobR}
          look={-3}
          skin="#B98E6E"
          hair="#2A2420"
          shirt={BEIGE}
          accessory="sunglasses"
          bubble={rightBubble}
          bubbleColor={BLUE}
          bubbleSide="left"
        />
      </View>

      <Animated.View
        style={{
          alignItems: 'center',
          marginTop: 56,
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
  stage: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  air: { flex: 1, height: PERSON_H },
  arc: {
    position: 'absolute', top: MOUTH_Y - ARC_H / 2, width: ARC_W, height: ARC_H,
    borderRadius: ARC_H / 2,
  },

  bubble: {
    position: 'absolute', top: 0, width: 42, height: 24, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 5,
  },
  bubbleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: BLACK },

  face: { width: HEAD, height: HEAD, borderRadius: HEAD / 2, overflow: 'hidden', alignItems: 'center' },
  hair: { position: 'absolute', top: 0, left: 0, right: 0 },
  longHair: {
    position: 'absolute', top: TOP_PAD - 4, left: (TORSO_W - (HEAD + 14)) / 2,
    width: HEAD + 14, height: HEAD + 30, borderRadius: 38,
  },
  eyes: { position: 'absolute', top: 36, flexDirection: 'row', gap: 15 },
  eye: { width: 8, height: 8, borderRadius: 4, backgroundColor: BLACK },
  shades: { position: 'absolute', top: 33, flexDirection: 'row', alignItems: 'center' },
  lens: { width: 24, height: 15, borderRadius: 7, backgroundColor: BLACK },
  bridge: { width: 6, height: 3, backgroundColor: BLACK },
  mouth: {
    position: 'absolute', top: 50, width: 20, height: 11, borderRadius: 6,
    backgroundColor: '#3A1F1F',
  },

  band: {
    position: 'absolute', top: -7, left: -4, width: HEAD + 8, height: HEAD / 2 + 4,
    borderTopLeftRadius: (HEAD + 8) / 2, borderTopRightRadius: (HEAD + 8) / 2,
    borderWidth: 5, borderBottomWidth: 0, borderColor: BLACK,
  },
  cup: {
    position: 'absolute', top: 28, width: 13, height: 24, borderRadius: 6,
    backgroundColor: BLACK, borderWidth: 2, borderColor: BLUE,
  },

  torso: {
    width: TORSO_W, height: 62, marginTop: 3,
    borderTopLeftRadius: TORSO_W / 2, borderTopRightRadius: TORSO_W / 2,
  },
  cane: {
    position: 'absolute', right: 2, top: TOP_PAD + HEAD + 10, width: 5, height: 66,
    borderRadius: 2, backgroundColor: BEIGE, transform: [{ rotate: '8deg' }],
  },
  hand: { position: 'absolute', top: -6, left: -5, width: 14, height: 14, borderRadius: 7 },
  caneTip: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 12, backgroundColor: BLACK, borderRadius: 2 },

  title: { color: BEIGE, fontSize: 38, fontWeight: '800', letterSpacing: 0.5 },
  tag: { color: BLUE, fontSize: 16, marginTop: 6, letterSpacing: 1 },
  btnWrap: { position: 'absolute', left: 24, right: 24 },
  btn: { backgroundColor: BEIGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: BLACK, fontSize: 17, fontWeight: '700' },
});
