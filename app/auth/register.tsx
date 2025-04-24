import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Briefcase,
  Image as ImageIcon,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const titleOptions = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Ms.', value: 'Ms.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Dr.', value: 'Dr.' },
];

const registerSchema = z
  .object({
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
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    photo: z.string().optional(),
    isCompanyDevice: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

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
    },
  });

  const photo = watch('photo');
  const isCompanyDevice = watch('isCompanyDevice');

  const onSubmitHandler = async (data: FormData) => {
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

  const navigateToLogin = () => {
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to get started</Text>

          {errors.root && (
            <Text style={styles.errorText}>{errors.root.message}</Text>
          )}

          <Controller
            control={control}
            name="title"
            rules={{}}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Title"
                options={titleOptions}
                value={value}
                onChange={onChange}
                placeholder="Select your title"
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="name"
            rules={{}}
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
            rules={{}}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Staff ID"
                placeholder="Enter your staff ID"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Briefcase size={20} color={Colors.light.subtext} />}
                error={errors.staffId?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="mobile"
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10,15}$/,
                message: 'Please enter a valid mobile number',
              },
            }}
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
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Please enter a valid email',
              },
            }}
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
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
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

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) =>
                value === watch('password') || 'Passwords do not match',
            }}
            render={({
              field: { onChange, onBlur, value },
            }: {
              field: FieldProps;
            }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                leftIcon={<Lock size={20} color={Colors.light.subtext} />}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <View style={styles.photoContainer}>
            <Text style={styles.photoLabel}>Photo</Text>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={() =>
                pickImage().then((uri) => {
                  if (uri) setValue('photo', uri);
                })
              }
            >
              {photo ? (
                <View style={styles.photoPreviewContainer}>
                  <Image
                    source={{ uri: watch('photo') }}
                    style={styles.photoPreview}
                  />
                </View>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <ImageIcon size={24} color={Colors.light.primary} />
                  <Text style={styles.photoPlaceholderText}>Choose photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.companyDeviceContainer}>
            <Text style={styles.companyDeviceLabel}>Is Company Device</Text>
            <TouchableOpacity
              style={[
                styles.companyDeviceSwitch,
                isCompanyDevice && styles.companyDeviceSwitchActive,
              ]}
              onPress={() => setValue('isCompanyDevice', !isCompanyDevice)}
            >
              <View
                style={[
                  styles.companyDeviceSwitchThumb,
                  isCompanyDevice && styles.companyDeviceSwitchThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Register"
            onPress={handleSubmit(onSubmitHandler)}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  photoContainer: {
    marginBottom: Layout.spacing.m,
  },
  photoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  photoButton: {
    height: 100,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
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
  photoPreviewContainer: {
    width: '100%',
    height: '100%',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  companyDeviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.l,
  },
  companyDeviceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  companyDeviceSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.border,
    padding: 2,
  },
  companyDeviceSwitchActive: {
    backgroundColor: Colors.light.primary,
  },
  companyDeviceSwitchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.card,
    ...Layout.shadow.light,
  },
  companyDeviceSwitchThumbActive: {
    transform: [{ translateX: 20 }],
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
