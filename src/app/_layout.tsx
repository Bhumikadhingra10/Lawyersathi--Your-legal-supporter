import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';

// Prevent the splash screen from auto-hiding before our JS bundle is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="document-upload" options={{ presentation: 'card' }} />
        <Stack.Screen name="documents-vault" options={{ presentation: 'card' }} />
        <Stack.Screen name="lawyer-registration" options={{ presentation: 'card' }} />
        <Stack.Screen name="lawyer-applications" options={{ presentation: 'card' }} />
        <Stack.Screen name="chat" options={{ presentation: 'card' }} />
        <Stack.Screen name="about" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
