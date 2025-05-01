import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import Radio from '@/components/Radio';
import Switch from '@/components/Switch';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layout/AuthLayout'; // Import AuthLayout
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import {
  Briefcase,
  Lock,
  Mail,
  MoveRight,
  Phone,
  User,
  User2,
} from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const titleOptions = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Mrs.', value: 'Mrs.' },
];

const registerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  name: z.string().min(1, 'Name is required'),
  staffId: z.string().min(1, 'Staff ID is required'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number cannot exceed 15 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only digits'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // confirmPassword: z.string().min(1, 'Please confirm your password'),
  photo: z.string().optional(),
  isCompanyDevice: z.boolean(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// });

type FormData = z.infer<typeof registerSchema>;

type FieldProps = {
  onChange: (value: string) => void;
  onBlur: () => void;
  value: string;
};

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isCompanyDevice: false,
      title: titleOptions[0].value,
    },
  });
  const navigation = useNavigation();

  const photo = watch('photo');
  const isCompanyDevice = watch('isCompanyDevice');

  const pickImage = async (): Promise<string | undefined> => {
    const result = await new Promise<string | undefined>((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const uri = await takePhoto();
              resolve(uri);
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const uri = await chooseFromGallery();
              resolve(uri);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(undefined),
          },
        ],
        { cancelable: true }
      );
    });
    return result;
  };

  const takePhoto = async (): Promise<string | undefined> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos'
        );
        return undefined;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      return result.canceled ? undefined : result.assets[0].uri;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return undefined;
    }
  };

  const chooseFromGallery = async (): Promise<string | undefined> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library permission is required to select photos'
        );
        return undefined;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      return result.canceled ? undefined : result.assets[0].uri;
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
      return undefined;
    }
  };

  const onSubmitHandler = async (data: FormData) => {
    console.log(data);
    try {
      const success = await register(data);
      if (!success) {
        setFormError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.',
        });
      } else {
        router.push('/auth/verify-otp');
      }
    } catch (error) {
      setFormError('root', {
        type: 'manual',
        message: 'An error occurred. Please try again later.',
      });
    }
  };

  return (
    <>
      <AuthLayout>
        <AppHeader title="Create New Account" bg="primary" />
        <ScrollView keyboardShouldPersistTaps="handled">
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
          >
            <Card style={styles.card}>
              <Text style={styles.subtitle}>Register to get started</Text>

              {errors.root && (
                <Text style={styles.errorText}>{errors.root.message}</Text>
              )}

              <Animated.View
                entering={FadeInDown.duration(500).delay(200)}
                style={styles.photoContainer}
              >
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() =>
                    pickImage().then((uri) => {
                      if (uri) setValue('photo', uri);
                    })
                  }
                >
                  {photo ? (
                    <Image
                      source={{ uri: watch('photo') }}
                      style={styles.photoPreview}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <User2 size={24} color={Colors.light.primary} />
                      <Text style={styles.photoPlaceholderText}>Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Radio
                    label="Title"
                    options={titleOptions}
                    value={value}
                    onChange={onChange}
                    error={errors.title?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={<User size={20} color={Colors.light.subtext} />}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="staffId"
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
                    error={errors.staffId?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="mobile"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mobile Number"
                    placeholder="Enter your mobile number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    leftIcon={<Phone size={20} color={Colors.light.subtext} />}
                    error={errors.mobile?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
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
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({
                  field: { onChange, onBlur, value },
                }: {
                  field: FieldProps;
                }) => (
                  <Input
                    label="Password"
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    showPasswordToggle
                    leftIcon={<Lock size={20} color={Colors.light.subtext} />}
                    error={errors.password?.message}
                  />
                )}
              />

              <Switch
                value={isCompanyDevice}
                onChange={(value) => setValue('isCompanyDevice', value)}
                label="Is Company Device"
              />

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
                  size="small"
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
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: Layout.spacing.m,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: 60,
    backgroundColor: Colors.light.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
