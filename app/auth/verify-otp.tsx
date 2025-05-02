import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layout/AuthLayout';
import { zodResolver } from '@hookform/resolvers/zod'; // Import zodResolver
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form'; // Import react-hook-form
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { MoveRight } from 'lucide-react-native';

const OTP_LENGTH = 6;

const otpSchema = z.object({
  otp: z.string().length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`),
});

type FormData = z.infer<typeof otpSchema>;

export default function VerifyOTPScreen() {
  const { verifyOtp, tempUserData, isLoading } = useAuth();
  const [remainingTime, setRemainingTime] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [apiError, setApiError] = useState(''); // For API errors

  const inputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
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
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    setRemainingTime(60);
    setCanResend(false);
    setApiError(''); // Clear API error on resend
    setValue('otp', ''); // Clear OTP input on resend

    // TODO: Add logic here to actually call the resend OTP API endpoint
    console.log('Resend OTP requested');

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

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();
    setApiError('');
    const res = await verifyOtp(data.otp);

    if (res === true) {
      router.replace('/auth/login');
    } else {
      setApiError(res || 'Invalid OTP. Please try again.');
    }
  };

  const email = tempUserData?.get('sEmail')?.toString();

  return (
    <AuthLayout>
      <AppHeader title="Verify Your Email" bg="primary" />
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <Card style={styles.card}>
          <View style={{ marginTop: Layout.spacing.xl }}>
            <Text style={styles.subtitle}>
              We have sent a verification code to the email address &nbsp;
            </Text>
            <Text style={styles.email}>'{email}'</Text>
          </View>

          {/* OTP Input managed by Controller */}
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <View style={styles.otpContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  value={value}
                  onChangeText={(text) => {
                    const sanitizedText = text
                      .replace(/[^0-9]/g, '')
                      .substring(0, OTP_LENGTH);
                    onChange(sanitizedText);
                  }}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus
                  onBlur={() => Keyboard.dismiss()}
                />

                <View style={styles.otpBoxesContainer}>
                  {Array(OTP_LENGTH)
                    .fill(0)
                    .map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.otpBox,
                          // Highlight based on current input length or focus state if needed
                          value.length === index && styles.otpBoxActive, // Use value from Controller
                          (!!errors.otp || !!apiError) && styles.otpBoxError,
                        ]}
                        onPress={() => inputRef.current?.focus()}
                        activeOpacity={1}
                      >
                        <Text style={styles.otpBoxText}>
                          {value[index] || ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
          />

          {(errors.otp || apiError) && (
            <Text style={styles.errorText}>
              {errors.otp?.message || apiError}
            </Text>
          )}

          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            style={styles.timerContainer}
          >
            <Text style={styles.timerText}>
              {canResend
                ? 'You can resend the OTP now'
                : `Resend OTP in ${formatTime(remainingTime)}`}
            </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={!canResend}
              style={[
                styles.resendButton,
                !canResend && styles.resendButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  !canResend && styles.resendButtonTextDisabled,
                ]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={styles.button}
          >
            <Button
              title="Verify"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              icon={<MoveRight size={20} color={Colors.light.background} />}
              iconPosition="right"
              // disabled={otpValue.length !== OTP_LENGTH}
            />
          </Animated.View>

          {/* <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
          >
            <Button
              title="Go Back"
              size="small"
              onPress={navigateBack}
              variant="outline"
              fullWidth
            />
          </Animated.View> */}
        </Card>
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: Layout.spacing.m,
  },
  email: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
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
    // Style for the currently focused box (optional)
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  otpBoxError: {
    // Style for boxes when there's an error
    borderColor: Colors.light.error,
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
