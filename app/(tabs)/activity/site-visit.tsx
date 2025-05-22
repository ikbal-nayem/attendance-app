import { submitAttendance, useAttendanceData } from '@/api/attendance.api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SingleImagePicker from '@/components/SingleImagePicker';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useToast } from '@/context/ToastContext';
import { getAddressFromCoordinates } from '@/services/location';
import { makeFormData } from '@/utils/form-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ClockArrowDown, ClockArrowUp, FileText, History, MapPin } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const siteVisitSchema = z.object({
  sEntryNote: z.string().optional(),
  sEntryType: z.string().min(1, 'Entry type is required'),
  sPhoto: z.string().min(1, 'Face photo is required'),
});

type SiteVisitFormData = z.infer<typeof siteVisitSchema>;

export default function SiteVisitScreen() {
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation, requestLocationPermission } = useLocation();

  const [address, setAddress] = useState('Fetching location...');
  const { attendanceData, isLoading: isLoadingAttendanceData } = useAttendanceData(
    user?.companyID || '',
    user?.employeeCode || ''
  );
  const [entryNo, setEntryNo] = useState(+(attendanceData?.noOfEntry || '0'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValuesRef = useRef({
    sEntryNote: '',
    sEntryType: '',
    sPhoto: '',
  });

  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SiteVisitFormData>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: defaultValuesRef.current,
  });

  useEffect(() => {
    if (attendanceData?.entryTypeList?.[1]?.code) {
      setValue('sEntryType', attendanceData.entryTypeList[1].code);
      defaultValuesRef.current.sEntryType = attendanceData.entryTypeList[1].code;
    }
    setEntryNo(+(attendanceData?.noOfEntry || '0'));
  }, [attendanceData, setValue]);

  useEffect(() => {
    const initialize = async () => {
      await requestLocationPermission();
      const latLong = await getCurrentLocation();
      if (latLong) {
        try {
          const locationAddress = await getAddressFromCoordinates(
            latLong.latitude,
            latLong.longitude
          );
          setAddress(locationAddress);
        } catch (error) {
          console.error('Failed to get address from coordinates:', error);
          setAddress('Could not fetch address');
        }
      } else {
        setAddress('Location permission not granted or unavailable');
      }
    };
    initialize();
  }, [getCurrentLocation, requestLocationPermission]);

  const onSubmit = async (data: SiteVisitFormData) => {
    if (!currentLocation) {
      Alert.alert(
        'Location Unavailable',
        'Please wait for your location to be determined or grant permission.'
      );
      return;
    }
    setIsSubmitting(true);
    const reqData = {
      ...data,
      sLatitude: currentLocation.latitude,
      sLongitude: currentLocation.longitude,
      sLocation: address,
      sUserID: user?.userID,
      sSessionID: user?.sessionID,
      sCompanyID: user?.companyID,
      sEmployeeCode: user?.employeeCode,
      sEntryTime: attendanceData?.entryTime,
    };
    submitAttendance(makeFormData(reqData))
      .then((res) => {
        if (res.success) {
          showToast({
            type: 'success',
            message: `Check-in successfully`,
          });
          setEntryNo((prev) => prev + 1);
          reset(defaultValuesRef.current);
        } else {
          showToast({ type: 'error', message: res.message || 'Failed to submit check-in' });
        }
      })
      .catch((err) => {
        console.error('Error submitting check-in:', err);
        Alert.alert('Error', 'An unexpected error occurred');
      })
      .finally(() => setIsSubmitting(false));
  };

  let isCheckIn = entryNo % 2 === 1;

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Attendance"
        // leftContent={<Text style={styles.entryText}>Entry {Math.floor(entryNo / 2 + 1)}</Text>}
        rightContent={
          <TouchableOpacity onPress={() => router.push('/(tabs)/attendance/history')}>
            <History color={Colors.light.background} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="outlined" style={styles.attendanceCard}>
          {/* Location Display */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationInputContainer}>
              <MapPin size={20} color={Colors.light.subtext} style={styles.locationIcon} />
              <Text style={styles.locationText}>
                {isLoadingAttendanceData
                  ? 'Loading location...'
                  : address || 'Location not available'}
              </Text>
            </View>
          </View>

          {/* Face Photo Input using SingleImagePicker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Face Photo <Text style={{ color: Colors.light.error }}>*</Text>
            </Text>
            <Controller
              control={control}
              name="sPhoto"
              render={({ field: { onChange, value } }) => (
                <>
                  <SingleImagePicker
                    photoUri={value}
                    setPhotoUri={(uri) => onChange(uri ?? '')}
                    source="camera"
                    previewContainerStyle={styles.photoPreviewContainer}
                  />
                  {errors.sPhoto && <Text style={styles.errorText}>{errors.sPhoto.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Note Input */}
          <Controller
            control={control}
            name="sEntryNote"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Note"
                placeholder="Add a note (optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                leftIcon={<FileText size={20} color={Colors.light.subtext} />}
                error={errors.sEntryNote?.message}
              />
            )}
          />

          {/* Status Select */}
          <Controller
            control={control}
            name="sEntryType"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Entry Type"
                required
                options={attendanceData?.entryTypeList ?? []}
                keyProp="code"
                valueProp="name"
                value={value}
                onChange={onChange}
                error={errors.sEntryType?.message}
                placeholder="Select entry type"
                disabled={isLoadingAttendanceData}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title={isCheckIn ? 'Check Out' : 'Check In'}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting || isLoadingAttendanceData}
            fullWidth
            style={[
              styles.actionButton,
              { backgroundColor: isCheckIn ? Colors.light.error : Colors.light.primary },
            ]}
            icon={
              isCheckIn ? (
                <ClockArrowDown color={Colors.light.background} />
              ) : (
                <ClockArrowUp color={Colors.light.background} />
              )
            }
            iconPosition="right"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  attendanceCard: {
    marginBottom: Layout.spacing.m,
  },
  inputGroup: {
    marginBottom: Layout.spacing.m,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.inputBackground,
    minHeight: Layout.inputHeight,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
  },
  locationIcon: {
    marginRight: Layout.spacing.s,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  photoPreviewContainer: {
    height: 150,
    width: '100%',
    borderRadius: Layout.borderRadius.medium,
  },
  actionButton: {
    marginTop: Layout.spacing.m,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
});
