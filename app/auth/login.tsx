import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useToast } from '@/context/ToastContext';
import AuthLayout from '@/layout/AuthLayout';
import { makeFormData } from '@/utils/form-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Lock, MoveRight, User } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
  sUserID: z.string().min(1, 'Staff ID or Email is required'),
  sPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof loginSchema>;

type FieldProps = {
  onChange: (value: string) => void;
  onBlur: () => void;
  value: string;
};

export default function LoginScreen() {
  const { showToast } = useToast();
  const { login, isLoading } = useAuth();
  const { currentLocation, getAddressFromCoordinates } = useLocation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      sUserID: '',
      sPassword: '',
    },
  });

  const onSubmit = async (data: IObject) => {
    data = {
      ...data,
      sLatitude: currentLocation?.latitude,
      sLongitude: currentLocation?.longitude,
      sLocation: await getAddressFromCoordinates(
        currentLocation?.latitude,
        currentLocation?.longitude
      ),
    };
    const success = await login(makeFormData(data));
    if (!success) {
      setFormError('root', {
        type: 'manual',
        message: 'Invalid credentials. Please try again.',
      });
    } else {
      showToast({
        type: 'success',
        message: 'Login successful!',
      });
      router.replace('/(tabs)');
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <AuthLayout>
      {header()}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 100 }}
      >
        <Card style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {errors.root && (
            <Text style={styles.errorText}>{errors.root?.message}</Text>
          )}

          <Controller
            name="sUserID"
            control={control}
            render={({
              field: { onChange, onBlur, value },
            }: {
              field: FieldProps;
            }) => (
              <Input
                label="Staff ID or Email"
                placeholder="Staff ID or Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<User size={20} color={Colors.light.subtext} />}
                error={errors.sUserID?.message}
              />
            )}
          />

          <Controller
            name="sPassword"
            control={control}
            render={({
              field: { onChange, onBlur, value },
            }: {
              field: FieldProps;
            }) => (
              <Input
                label="Password"
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
                secureTextEntry
                showPasswordToggle
                leftIcon={<Lock size={20} color={Colors.light.subtext} />}
                error={errors.sPassword?.message}
              />
            )}
          />

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            icon={<MoveRight size={20} color={Colors.light.background} />}
            iconPosition="right"
            loading={isLoading}
            fullWidth
            style={styles.button}
          />

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 200 }}
            style={styles.registerContainer}
          >
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </MotiView>
        </Card>
      </MotiView>
    </AuthLayout>
  );
}

const header = () => (
  <MotiView
    style={styles.logoContainer}
    from={{ opacity: 0, translateY: -50 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 500 }}
  >
    <Image
      source={require('../../assets/images/logo.png')}
      style={styles.logoImage}
    />
    <Text style={styles.logoText}>Supervisor/Manager Activity Tracking</Text>
  </MotiView>
);

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: Colors.light.primary,
    borderEndEndRadius: Layout.borderRadius.xl,
    borderStartEndRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.m,
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  logoImage: {
    width: '70%',
    height: 90,
    resizeMode: 'contain',
  },
  logoText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    textAlign: 'center',
    color: Colors.light.primaryLight,
    marginTop: Layout.spacing.m,
  },
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
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  button: {
    marginBottom: Layout.spacing.l,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  registerLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
  },
});
