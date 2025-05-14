import Button from '@/components/Button'; // Assuming Button component path
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input'; // Assuming Input component path
import SingleImagePicker from '@/components/SingleImagePicker'; // Assuming SingleImagePicker component path
import AppStatusBar from '@/components/StatusBar';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { generateUserImage } from '@/utils/generator';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Define the Zod schema for validation
const profileSchema = z.object({
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  photo: z.string().optional(), // Assuming photo is stored as a URI string
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileUpdateScreen = () => {
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      mobile: user?.mobileNo || '',
      email: user?.emailAddress || '',
      photo: generateUserImage(user?.userID!, user?.sessionID!, user?.companyID!),
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    console.log('Profile data submitted:', data);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar />
      <AppHeader title="Update Profile" rightContent={<View style={{ width: 24 }} />} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined">
          <View style={styles.photoSection}>
            <Controller
              control={control}
              name="photo"
              render={({ field: { onChange, value } }) => (
                <SingleImagePicker photoUri={value} setPhotoUri={onChange} />
              )}
            />
            {errors.photo && <Text style={styles.errorText}>{errors.photo.message}</Text>}
          </View>

          <Input label="Name" readOnly value={user?.userName} />
          <Input label="Staff ID" readOnly value={user?.userID} />

          {/* Editable fields */}
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile"
                placeholder="Enter mobile number"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.mobile?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter email address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                keyboardType="email-address"
              />
            )}
          />

          <Button title="Update Profile" onPress={handleSubmit(onSubmit)} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  photoSection: {
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default ProfileUpdateScreen;
