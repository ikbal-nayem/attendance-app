import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen() {
  const { verifyOtp, tempUserData, isLoading } = useAuth();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [remainingTime, setRemainingTime] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (text: string) => {
    // Keep only digits and limit to OTP_LENGTH
    const sanitizedText = text.replace(/[^0-9]/g, '').substring(0, OTP_LENGTH);
    setOtp(sanitizedText);
    setOtpError('');
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    setRemainingTime(60);
    setCanResend(false);
    
    // Reset timer
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Please enter all ${OTP_LENGTH} digits of the OTP`);
      return;
    }

    const success = await verifyOtp(otp);

    if (success) {
      router.replace('/auth/login');
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to your email</Text>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Name:</Text>
            <Text style={styles.userInfoValue}>{tempUserData?.name || 'User'}</Text>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Staff ID:</Text>
            <Text style={styles.userInfoValue}>{tempUserData?.staffId || 'N/A'}</Text>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Phone:</Text>
            <Text style={styles.userInfoValue}>{tempUserData?.mobile || 'N/A'}</Text>
          </View>

          <View style={styles.otpContainer}>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
            />
            
            <View style={styles.otpBoxesContainer}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.otpBox,
                    otp.length === index && styles.otpBoxActive,
                  ]}
                  onPress={() => inputRef.current?.focus()}
                >
                  <Text style={styles.otpBoxText}>
                    {otp[index] || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {canResend ? 'You can resend the OTP now' : `Resend OTP in ${formatTime(remainingTime)}`}
            </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={!canResend}
              style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
            >
              <Text
                style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Edit Details"
            onPress={navigateBack}
            variant="outline"
            fullWidth
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.l,
  },
  card: {
    padding: Layout.spacing.xl,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.l,
    textAlign: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.s,
  },
  userInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.subtext,
    width: 80,
  },
  userInfoValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  otpContainer: {
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
  },
  otpBoxActive: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  otpBoxText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    color: Colors.light.text,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  timerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  resendButton: {
    padding: Layout.spacing.s,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
  },
  resendButtonTextDisabled: {
    color: Colors.light.subtext,
  },
  button: {
    marginBottom: Layout.spacing.m,
  },
});