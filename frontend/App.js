import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/theme';
import SplashScreen from './src/screens/SplashScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LipReadScreen from './src/screens/LipReadScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignLanguageScreen from './src/screens/SignLanguageScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TextToSpeechScreen from './src/screens/TextToSpeechScreen';
import SpeechToTextScreen from './src/screens/SpeechToTextScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { colors } = useSettings();
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  const barStyle = colors.dark ? 'light' : 'dark';
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          statusBarStyle: barStyle,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false, animation: 'fade', gestureEnabled: false, statusBarStyle: 'light' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="LipRead" component={LipReadScreen} options={{ title: 'Lip Reading' }} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ title: 'Emergency' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History & Stats' }} />
        <Stack.Screen name="SignLanguage" component={SignLanguageScreen} options={{ title: 'Sign Language' }} />
        <Stack.Screen name="TextToSpeech" component={TextToSpeechScreen} options={{ title: 'Text to Speech' }} />
        <Stack.Screen name="SpeechToText" component={SpeechToTextScreen} options={{ title: 'Speech to Text' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Accessibility' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Root />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
