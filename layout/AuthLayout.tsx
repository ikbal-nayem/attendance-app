import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type AuthLayoutProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default AuthLayout;
