import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ss_settings';
const DEFAULTS = { darkMode: false, highContrast: false, fontSize: 16 };

// Palette: dusty blue + warm beige + black.
export const BLUE = '#7E90A4';
export const BEIGE = '#D0CDC5';
export const BLACK = '#0A0A0A';

function getColors({ darkMode, highContrast }) {
  if (highContrast) {
    return {
      dark: true, hc: true,
      bg: '#000000', card: '#000000', text: '#FFFFFF', sub: '#FFFFFF',
      primary: BEIGE, onPrimary: '#000000', border: '#FFFFFF',
      danger: '#FFFFFF', onDanger: '#000000', warn: '#FFFFFF', accent: BEIGE,
    };
  }
  if (darkMode) {
    return {
      dark: true, hc: false,
      bg: BLACK, card: '#171717', text: BEIGE, sub: '#8F8B84',
      primary: BLUE, onPrimary: '#000000', border: '#2A2A2A',
      danger: BEIGE, onDanger: BLACK, warn: BEIGE, accent: BLUE,
    };
  }
  return {
    dark: false, hc: false,
    bg: BEIGE, card: '#DEDAD3', text: BLACK, sub: '#4A4A4A',
    primary: BLUE, onPrimary: '#000000', border: '#B5B0A6',
    danger: BLACK, onDanger: BEIGE, warn: BLACK, accent: BLUE,
  };
}

const Ctx = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => v && setSettings({ ...DEFAULTS, ...JSON.parse(v) }))
      .catch(() => {});
  }, []);

  const update = (patch) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

  return (
    <Ctx.Provider value={{ settings, update, colors: getColors(settings) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSettings = () => useContext(Ctx);
