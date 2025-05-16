import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated)
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications/send" options={{ headerShown: false }} />
      <Stack.Screen name="enquiry/live-tracking" options={{ headerShown: false }} />
      <Stack.Screen name="profile/update" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setIsAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!isAppReady) {
    return (
      <Animated.View
        style={styles.splashContainer}
        exiting={isAppReady ? FadeOut.duration(500) : undefined}
      >
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.splashLogo}
          resizeMode="cover"
        />
        <Text style={styles.splashText}>Supervisor Activity Tracking</Text>
        <ActivityIndicator
          size="large"
          color={Colors.light.primary}
          style={styles.loadingIndicator}
        />
      </Animated.View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <RootLayoutNav />
              <AppStatusBar />
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 150,
    height: 150,
    marginBottom: Layout.spacing.m,
  },
  splashText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    textAlign: 'center',
    color: Colors.light.text,
    marginBottom: Layout.spacing.l,
  },
  loadingIndicator: {
    marginTop: Layout.spacing.l,
  },
});
