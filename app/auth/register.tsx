import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Phone, User, Image as ImageIcon, Briefcase } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Select from '@/components/Select';

const titleOptions = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Ms.', value: 'Ms.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Dr.', value: 'Dr.' },
];

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    staffId: '',
    mobile: '',
    email: '',
    photo: '',
    isCompanyDevice: false,
  });
  const [error, setError] = useState('');

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const validateForm = () => {
    if (!formData.title) {
      setError('Please select a title');
      return false;
    }
    if (!formData.name) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.staffId) {
      setError('Please enter your staff ID');
      return false;
    }
    if (!formData.mobile) {
      setError('Please enter your mobile number');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setError('');
    const success = await register(formData);

    if (success) {
      router.push('/auth/verify-otp');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: chooseFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        updateFormData('photo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const chooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to select photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        updateFormData('photo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Select
            label="Title"
            options={titleOptions}
            value={formData.title}
            onChange={(value) => updateFormData('title', value)}
            placeholder="Select your title"
          />

          <Input
            label="Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            leftIcon={<User size={20} color={Colors.light.subtext} />}
          />

          <Input
            label="Staff ID"
            placeholder="Enter your staff ID"
            value={formData.staffId}
            onChangeText={(value) => updateFormData('staffId', value)}
            leftIcon={<Briefcase size={20} color={Colors.light.subtext} />}
          />

          <Input
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={formData.mobile}
            onChangeText={(value) => updateFormData('mobile', value)}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.light.subtext} />}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.light.subtext} />}
          />

          <View style={styles.photoContainer}>
            <Text style={styles.photoLabel}>Photo</Text>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickImage}
            >
              {formData.photo ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
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
                formData.isCompanyDevice && styles.companyDeviceSwitchActive,
              ]}
              onPress={() => updateFormData('isCompanyDevice', !formData.isCompanyDevice)}
            >
              <View
                style={[
                  styles.companyDeviceSwitchThumb,
                  formData.isCompanyDevice && styles.companyDeviceSwitchThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Register"
            onPress={handleRegister}
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