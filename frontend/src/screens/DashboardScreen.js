import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../theme';

const DRAWER_W = 290;

const MENU = [
  { title: 'Sign Language', icon: 'hand-left-outline', route: 'SignLanguage' },
  { title: 'Text to Speech', icon: 'volume-high-outline', route: 'TextToSpeech' },
  { title: 'Speech to Text', icon: 'mic-outline', route: 'SpeechToText' },
  { title: 'Emergency', icon: 'alert-circle-outline', route: 'Emergency' },
  { title: 'History & Stats', icon: 'time-outline', route: 'History' },
  { title: 'Profile', icon: 'person-circle-outline', route: 'Profile' },
  { title: 'Accessibility', icon: 'color-palette-outline', route: 'Settings' },
];

export default function DashboardScreen({ navigation }) {
  const { settings, colors } = useSettings();
  const fs = settings.fontSize;
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);

  const move = (to) => {
    setOpen(to);
    Animated.timing(slide, { toValue: to ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (open) {
        move(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [open]);

  const go = (route) => {
    move(false);
    navigation.navigate(route);
  };

  const border = colors.hc ? { borderWidth: 2, borderColor: colors.border } : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
        {/* top bar */}
        <View style={s.topBar}>
          <TouchableOpacity
            accessibilityLabel="Open menu"
            onPress={() => move(true)}
            style={[s.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="menu" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: fs + 2, fontWeight: '800', letterSpacing: 0.5 }}>
            Silent Signals
          </Text>
          <View style={{ width: 46 }} />
        </View>

        <Text style={{ color: colors.sub, fontSize: fs, marginTop: 28 }}>Welcome</Text>
        <Text style={{ color: colors.text, fontSize: fs + 16, fontWeight: '800', lineHeight: (fs + 16) * 1.15, marginTop: 4 }}>
          Say it without a sound.
        </Text>

        {/* hero */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('LipRead')}
          style={[s.hero, { backgroundColor: colors.primary }, border]}
        >
          <View style={s.ringA} />
          <View style={s.ringB} />
          <View style={[s.heroIcon, { backgroundColor: colors.onPrimary }]}>
            <Ionicons name="videocam" size={28} color={colors.primary} />
          </View>
          <Text style={{ color: colors.onPrimary, fontSize: fs + 10, fontWeight: '800', marginTop: 18 }}>
            Lip Reading
          </Text>
          <Text style={{ color: colors.onPrimary, fontSize: fs - 1, marginTop: 4, opacity: 0.8 }}>
            Record or pick a short clip and turn silent speech into text and voice.
          </Text>
          <View style={[s.startPill, { backgroundColor: colors.onPrimary }]}>
            <Text style={{ color: colors.primary, fontSize: fs, fontWeight: '700' }}>Start</Text>
            <Ionicons name="arrow-forward" size={fs + 2} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* quick emergency */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Emergency')}
          style={[s.emergency, { backgroundColor: colors.danger }, border]}
        >
          <Ionicons name="alert-circle" size={fs + 10} color={colors.onDanger} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.onDanger, fontSize: fs + 2, fontWeight: '800' }}>Emergency</Text>
            <Text style={{ color: colors.onDanger, fontSize: fs - 3, opacity: 0.75 }}>
              One tap to speak and alert your guardian
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={fs + 4} color={colors.onDanger} />
        </TouchableOpacity>

        <Text style={{ color: colors.sub, fontSize: fs - 3, textAlign: 'center', marginTop: 'auto' }}>
          Open the menu for history, accessibility and more.
        </Text>
      </View>

      {/* backdrop */}
      {open && (
        <TouchableWithoutFeedback onPress={() => move(false)}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000', opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }) },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* drawer */}
      <Animated.View
        style={[
          s.drawer,
          {
            width: DRAWER_W,
            backgroundColor: colors.card,
            borderRightColor: colors.border,
            paddingTop: insets.top + 24,
            transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_W - 4, 0] }) }],
          },
        ]}
      >
        <View style={s.drawerHead}>
          <View style={[s.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="pulse" size={22} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={{ color: colors.text, fontSize: fs + 3, fontWeight: '800' }}>Silent Signals</Text>
            <Text style={{ color: colors.sub, fontSize: fs - 3 }}>Menu</Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {MENU.map((m) => {
          const soon = !m.route;
          return (
            <TouchableOpacity
              key={m.title}
              disabled={soon}
              onPress={() => go(m.route)}
              style={[s.item, { opacity: soon ? 0.5 : 1 }]}
            >
              <Ionicons name={m.icon} size={fs + 6} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: fs + 1, fontWeight: '600', flex: 1 }}>{m.title}</Text>
              {soon ? (
                <View style={[s.soon, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: colors.onPrimary, fontSize: fs - 5, fontWeight: '700' }}>SOON</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuBtn: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { borderRadius: 28, padding: 22, marginTop: 28, overflow: 'hidden' },
  ringA: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    right: -50, top: -50, backgroundColor: 'rgba(0,0,0,0.08)',
  },
  ringB: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    right: 30, bottom: -60, backgroundColor: 'rgba(0,0,0,0.06)',
  },
  heroIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  startPill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, marginTop: 20,
  },
  emergency: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 22, padding: 18, marginTop: 14,
  },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, paddingHorizontal: 20,
    borderRightWidth: 1,
  },
  drawerHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  soon: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});
