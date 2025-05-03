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
import { useRouter } from 'expo-router';
import { Lock, MoveRight, User } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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

const header = () => {
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-50);

  const logoAnimation = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  React.useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoTranslateY.value = withSpring(0, {
      damping: 10,
      stiffness: 100,
    });
  }, []);

  return (
    <Animated.View style={[styles.logoContainer, logoAnimation]}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} />
      <Text style={styles.logoText}>Supervisor/Manager Activity Tracking</Text>
    </Animated.View>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const cardAnimation = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const registerOpacity = useSharedValue(0);
  const registerTranslateY = useSharedValue(20);
  const registerAnimation = useAnimatedStyle(() => ({
    opacity: registerOpacity.value,
    transform: [{ translateY: registerTranslateY.value }],
  }));

  React.useEffect(() => {
    cardOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    cardTranslateY.value = withSpring(0, {
      damping: 10,
      stiffness: 100,
    });
    registerOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    registerTranslateY.value = withSpring(0, {
      damping: 10,
      stiffness: 100,
    });
  }, []);
  const { showToast } = useToast();
  const { login, user, isLoading } = useAuth();
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
    login(makeFormData(data))
      .then((res) => {
        if (res !== true) return;
        showToast({
          type: 'success',
          message: `Welcome back, ${user?.userName}`,
        });
        router.replace('/(tabs)');
      })
      .catch((res) => {
        setFormError('root', {
          type: 'manual',
          message: res || 'Something went wrong. Please try again.',
        });
      });
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <AuthLayout>
      {header()}
      <ScrollView keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.cardContainer, cardAnimation]}>
          <Card style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <Controller
              name="sUserID"
              control={control}
              render={({ field: { onChange, onBlur, value } }: { field: FieldProps }) => (
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
              render={({ field: { onChange, onBlur, value } }: { field: FieldProps }) => (
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

            {errors.root && <Text style={styles.errorText}>{errors.root?.message}</Text>}

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              icon={<MoveRight size={20} color={Colors.light.background} />}
              iconPosition="right"
              loading={isLoading}
              fullWidth
              style={styles.button}
            />

            <Animated.View style={[styles.registerContainer, registerAnimation]}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </Animated.View>
          </Card>
        </Animated.View>
      </ScrollView>
    </AuthLayout>
  );
}

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
  cardContainer: {
    opacity: 0,
    transform: [{ translateY: 50 }],
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
    fontWeight: 'bold',
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
