import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import { ProfileImagePicker } from '@/components/ProfileImagePicker';
import Radio from '@/components/Radio';
import Switch from '@/components/Switch';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import AuthLayout from '@/layout/AuthLayout';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { makeFormData } from '@/utils/form-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Briefcase, Mail, MoveRight, Phone, User } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { z } from 'zod';

const titleOptions = [
  { label: 'Mr.', value: 'M' },
  { label: 'Mrs.', value: 'F' },
];

const registerSchema = z.object({
  sTitle: z.string().min(1, 'Title is required'),
  sUserName: z.string().min(1, 'Name is required'),
  sStaffID: z.string().min(1, 'Staff ID is required'),
  sMobileNo: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(13, 'Mobile number cannot exceed 13 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only digits'),
  sEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  sPhoto: z.any(),
  sDeviceFlag: z.boolean(),
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { registerRequest, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sDeviceFlag: false,
      sTitle: titleOptions[0].value,
    },
  });
  const { currentLocation, getAddressFromCoordinates } = useLocation();

  const onSubmitHandler = async (data: FormData) => {
    const deviceInfo = getDeviceInfo();
    const reqData = {
      ...data,
      sLatitude: currentLocation?.latitude,
      sLongitude: currentLocation?.longitude,
      sLocation: await getAddressFromCoordinates(
        currentLocation?.latitude,
        currentLocation?.longitude
      ),
      sDeviceInfo: deviceInfo.deviceBrand,
      sDeviceModel: deviceInfo.deviceModel,
      sDevicePlatForm: deviceInfo.platform,
      sDeviceVersion: deviceInfo.osVersion,
      sDeviceID: deviceInfo.deviceId,
    };
    registerRequest(makeFormData(reqData))
      .then((res) => {
        if (res === true) {
          router.push('/auth/verify-otp');
          return;
        }
        setFormError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.',
        });
      })
      .catch((error) => {
        setFormError('root', {
          type: 'manual',
          message: 'An error occurred. Please try again later.',
        });
      });
  };

  return (
    <>
      <AuthLayout>
        <AppHeader title="Create New Account" bg="primary" />
        <ScrollView keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <Card style={styles.card}>
              <Text style={styles.subtitle}>Register to get started</Text>

              <Controller
                control={control}
                name="sPhoto"
                render={({ field: { onChange, value } }) => (
                  <ProfileImagePicker photo={value} setPhoto={onChange} />
                )}
              />

              <Controller
                control={control}
                name="sTitle"
                render={({ field: { onChange, value } }) => (
                  <Radio
                    label="Title"
                    options={titleOptions}
                    value={value}
                    onChange={onChange}
                    error={errors.sTitle?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sUserName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<User size={20} color={Colors.light.subtext} />}
                    error={errors.sUserName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sStaffID"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Staff ID"
                    placeholder="Enter your staff ID"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={
                      <Briefcase size={20} color={Colors.light.subtext} />
                    }
                    error={errors.sStaffID?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sMobileNo"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mobile Number"
                    placeholder="Enter your mobile number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    leftIcon={<Phone size={20} color={Colors.light.subtext} />}
                    error={errors.sMobileNo?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={20} color={Colors.light.subtext} />}
                    error={errors.sEmail?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sDeviceFlag"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onChange={onChange}
                    label="Is Company Device"
                  />
                )}
              />

              {errors.root && (
                <Text style={styles.errorText}>{errors.root.message}</Text>
              )}

              <Animated.View
                entering={FadeInDown.duration(500).delay(400)}
                style={styles.button}
              >
                <Button
                  title="Register"
                  onPress={handleSubmit(onSubmitHandler)}
                  icon={<MoveRight size={20} color={Colors.light.background} />}
                  iconPosition="right"
                  loading={isLoading}
                  fullWidth
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(500).delay(500)}
                style={styles.loginContainer}
              >
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Animated.View>
            </Card>
          </Animated.View>
        </ScrollView>
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: Layout.spacing.m,
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
  errorText: {
    fontFamily: 'Inter-Regular',
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  button: {
    marginBottom: Layout.spacing.l,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
  },
});
