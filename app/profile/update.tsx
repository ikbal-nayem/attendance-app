import Button from '@/components/Button'; // Assuming Button component path
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input'; // Assuming Input component path
import SingleImagePicker from '@/components/SingleImagePicker'; // Assuming SingleImagePicker component path
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import { USER_DEVICE_ID } from '@/constants/common';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { localData } from '@/services/storage';
import { makeFormData } from '@/utils/form-actions';
import { generateUserImage } from '@/utils/generator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Define the Zod schema for validation
const profileSchema = z.object({
  sMobileNo: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(13, 'Mobile number must be at most 13 digits'),
  sEmail: z.string().email('Invalid email address'),
  sPhoto: z.string().optional(), // Assuming photo is stored as a URI string
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileUpdateScreen = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      sMobileNo: user?.mobileNo || '',
      sEmail: user?.emailAddress || '',
      sPhoto: generateUserImage(user?.userID!, user?.sessionID!, user?.companyID!),
    },
  });

  const onSubmit = async (data: IObject) => {
    data = {
      ...data,
      sUserID: user?.userID,
      sCompanyID: user?.companyID,
      sSessionID: user?.sessionID,
      sEmployeeCode: user?.employeeCode,
      sDeviceID: await localData.get(USER_DEVICE_ID),
    };
    updateProfile(makeFormData(data))
      .then((res) => {
        if (res instanceof Object && res?.success == true) {
          showToast({
            type: 'success',
            message: res?.message || 'Profile updated successfully',
          });
        }
      })
      .catch((err) => {
        setError('root', {
          type: 'manual',
          message: err || 'Failed to update profile',
        });
      });
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
              name="sPhoto"
              render={({ field: { onChange, value } }) => (
                <SingleImagePicker photoUri={value} setPhotoUri={onChange} />
              )}
            />
            {errors.sPhoto && <Text style={styles.errorText}>{errors.sPhoto?.message}</Text>}
          </View>

          <Input label="Name" readOnly value={user?.userName} />
          <Input label="Staff ID" readOnly value={user?.userID} />

          {/* Editable fields */}
          <Controller
            control={control}
            name="sMobileNo"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile"
                placeholder="Enter mobile number"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.sMobileNo?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="sEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter email address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.sEmail?.message}
                keyboardType="email-address"
              />
            )}
          />

          {errors.root && <Text style={styles.errorText}>{errors.root?.message}</Text>}

          {/* Submit button */}
          <Button
            title="Update"
            icon={<Save color={Colors.dark.text} />}
            iconPosition='right'
            disabled={isLoading}
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
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
