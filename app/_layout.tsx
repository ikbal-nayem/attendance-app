import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      setIsAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!isAppReady || isSplashVisible) {
    return (
      <MotiView
        style={styles.splashContainer}
        from={{ opacity: 1 }}
        animate={{ opacity: isAppReady ? 0 : 1 }}
        transition={{ duration: 500 }}
        onDidAnimate={(_key, finished) => {
          if (finished && isAppReady) {
            setIsSplashVisible(false);
          }
        }}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>Employee Attendance</Text>
        {!isAppReady && (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={styles.loadingIndicator}
          />
        )}
      </MotiView>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <LocationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </LocationProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.light.background, // Use background color from new theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 150,
    height: 100,
    marginBottom: Layout.spacing.m,
  },
  splashText: {
    fontFamily: 'Inter-SemiBold', // Use a font from your loaded fonts
    fontSize: 24,
    color: Colors.light.text, // Use text color from new theme
    marginBottom: Layout.spacing.l,
  },
  loadingIndicator: {
    marginTop: Layout.spacing.l,
  },
});
