import AuthLayout from '@/components/AuthLayout'; // Import AuthLayout
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Lock, CircleUser as UserCircle } from 'lucide-react-native';
import { MotiView } from 'moti'; // Import MotiView
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

type FormData = {
  identifier: string;
  password: string;
};

type FieldProps = {
  onChange: (value: string) => void;
  onBlur: () => void;
  value: string;
};

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const success = await login(data.identifier, data.password);
    if (!success) {
      setFormError('root', {
        type: 'manual',
        message: 'Invalid credentials. Please try again.',
      });
    } else {
      router.replace('/(tabs)');
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <AuthLayout>
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
        <Text style={styles.logoText}>Atendance System</Text>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 100 }}
      >
        <Card style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {errors.root && (
            <Text style={styles.errorText}>{errors.root.message}</Text>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Staff ID or Email is required',
            }}
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
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<UserCircle size={20} color={Colors.light.subtext} />}
                error={errors.identifier?.message}
              />
            )}
            name="identifier"
            defaultValue=""
          />

          <Controller
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            }}
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
                secureTextEntry
                showPasswordToggle
                leftIcon={<Lock size={20} color={Colors.light.subtext} />}
                error={errors.password?.message}
              />
            )}
            name="password"
            defaultValue=""
          />

          {/* Keep the button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            size="small"
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

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  logoText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: Colors.light.primary,
    marginTop: Layout.spacing.m,
  },
  card: {
    padding: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
  // Removed forgotPassword styles as the element is commented out
  // forgotPassword: {
  //   alignSelf: 'flex-end',
  //   marginBottom: Layout.spacing.l,
  // },
  // forgotPasswordText: { // Keep commented out if element is commented out
  //   fontFamily: 'Inter-Medium',
  //   fontSize: 14,
  //   color: Colors.light.primary,
  // }, // Add closing brace and comma if uncommented
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
