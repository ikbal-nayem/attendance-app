import { useAttendanceData } from '@/api/attendance.api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera, FileText, History, MapPin } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for validation
const attendanceSchema = z.object({
  note: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  capturedPhoto: z.string().min(1, 'Face photo is required'),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

export default function AttendanceScreen() {
  const { user } = useAuth();
  const { currentLocation, getAddressFromCoordinates, requestLocationPermission } =
    useLocation();
  const cameraRef = useRef<CameraView>(null); // Ref for CameraView

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [address, setAddress] = useState('Fetching location...');
  const { attendanceData, isLoading: isLoadingAttendanceData } = useAttendanceData(
    user?.companyID || '',
    user?.employeeCode || ''
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      note: '',
      status: '', // Initialize empty, set in useEffect
      capturedPhoto: '',
    },
  });

  const capturedPhoto = watch('capturedPhoto'); // Watch the photo state from RHF

  // Set default status when attendanceData loads or changes
  useEffect(() => {
    if (attendanceData?.entryTypeList?.[0]?.code) {
      setValue('status', attendanceData.entryTypeList[0].code);
    }
  }, [attendanceData, setValue]);

  // Fetch location on mount
  useEffect(() => {
    const initialize = async () => {
      await requestLocationPermission();
      if (currentLocation) {
        try {
          const locationAddress = await getAddressFromCoordinates(
            currentLocation.latitude,
            currentLocation.longitude
          );
          setAddress(locationAddress);
        } catch (error) {
          console.error("Failed to get address from coordinates:", error);
          setAddress("Could not fetch address");
        }
      } else {
        setAddress("Location permission not granted or unavailable");
      }
    };
    initialize();
  }, [currentLocation, getAddressFromCoordinates, requestLocationPermission]);

  // Function to request camera permission and show camera view
  const takePicture = async () => {
    const { status: cameraPermStatus } = await requestCameraPermission();
    if (cameraPermStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }
    setShowCamera(true);
  };

  // Function to handle capturing the photo
  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        // Adjust quality/options as needed
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
        if (photo?.uri) {
          setValue('capturedPhoto', photo.uri, { shouldValidate: true }); // Update RHF state
          setShowCamera(false); // Close camera view
        } else {
          Alert.alert('Error', 'Failed to capture photo URI.');
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    } else {
      Alert.alert('Error', 'Camera reference is not available.');
    }
  };

  // Function to toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType((current) => (current === 'front' ? 'back' : 'front'));
  };

  // Function to handle form submission (Check In)
  const onSubmit = async (data: AttendanceFormData) => {
    if (!currentLocation) {
      Alert.alert(
        'Location Unavailable',
        'Please wait for your location to be determined or grant permission.'
      );
      return;
    }

    console.log('Submitting Check-In Data:', {
      ...data,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      address,
      // Add other necessary fields like userId, companyId etc.
      userId: user?.userID,
      companyId: user?.companyID,
      employeeCode: user?.employeeCode,
    });

    // --- Replace with actual API call ---
    // try {
    //   // Example: const response = await api.post('/check-in', checkInData);
    //   // Handle success/error based on response
    //   Alert.alert('Success', 'You have successfully checked in');
    //   reset({ note: '', status: attendanceData?.entryTypeList?.[0]?.code || '', capturedPhoto: '' }); // Reset form
    // } catch (error) {
    //   console.error('Error during check-in:', error);
    //   Alert.alert('Error', 'An unexpected error occurred during check-in.');
    // }
    // --- End of API call section ---

    // Mock success for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
    Alert.alert('Success (Mock)', 'Check-in submitted');
    reset({ note: '', status: attendanceData?.entryTypeList?.[0]?.code || '', capturedPhoto: '' });
  };

  // Render Camera View if showCamera is true
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraType}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <Text style={styles.flipButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Calculate entry number
  const numberOfEntry = +(attendanceData?.noOfEntry || '0') + 1;

  // Main screen render
  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Attendance"
        withBackButton={false}
        bg="primary"
        leftContent={<Text style={styles.entryText}>Entry {numberOfEntry}</Text>}
        rightContent={
          <TouchableOpacity onPress={() => router.push('/enquiry/attendance-history')}>
            <History color={Colors.light.background} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Keep keyboard open on tap outside input
      >
        <Card variant="elevated" style={styles.attendanceCard}>
          {/* Location Display (Not part of the form) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationInputContainer}>
              <MapPin
                size={20}
                color={Colors.light.subtext}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                {isLoadingAttendanceData ? 'Loading location...' : address || 'Location not available'}
              </Text>
            </View>
          </View>

          {/* Face Photo Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Face Photo *</Text>
            <Controller
              control={control}
              name="capturedPhoto"
              render={({ field: { value } }) => ( // Only need value here
                <>
                  <TouchableOpacity style={styles.photoButton} onPress={takePicture}>
                    {value ? (
                      <Image source={{ uri: value }} style={styles.capturedPhoto} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={24} color={Colors.light.primary} />
                        <Text style={styles.photoPlaceholderText}>Take Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {errors.capturedPhoto && (
                    <Text style={styles.errorText}>{errors.capturedPhoto.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Note Input */}
          <Controller
            control={control}
            name="note"
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
                error={errors.note?.message} // Display potential error
                style={styles.inputField} // Add common input style if needed
              />
            )}
          />

          {/* Status Select */}
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Status *"
                options={attendanceData?.entryTypeList ?? []}
                keyProp="code"
                valueProp="name"
                value={value}
                onChange={onChange}
                error={errors.status?.message} // Display potential error
                placeholder="Select status"
                disabled={isLoadingAttendanceData} // Disable while loading data
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title={'Check In'}
            onPress={handleSubmit(onSubmit)} // Trigger RHF validation and submission
            loading={isSubmitting} // Use RHF submitting state
            disabled={isSubmitting || isLoadingAttendanceData} // Disable if submitting or loading initial data
            fullWidth
            style={styles.actionButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
  },
  entryText: {
    color: Colors.light.background, // Assuming white text on primary bg
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xl, // Ensure enough space at the bottom
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
    alignItems: 'center', // Align items vertically
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.inputBackground,
    minHeight: Layout.inputHeight, // Use minHeight for potentially multi-line address
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s, // Add vertical padding for multi-line
  },
  locationIcon: {
    marginRight: Layout.spacing.s,
    alignSelf: 'flex-start', // Align icon to the top for multi-line text
    marginTop: 2, // Slight adjustment for alignment
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1, // Allow text to take remaining space
  },
  photoButton: {
    height: 150,
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
  capturedPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputField: {
    // Optional: Common style for Input component if needed
    // Add common styles here, e.g., marginBottom
  },
  actionButton: {
    marginTop: Layout.spacing.m,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Layout.spacing.xl,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
  },
  closeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
  },
  flipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
  },
  errorText: { // Style for validation error messages
    color: Colors.light.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: Layout.spacing.xs, // Use 'xs' which exists in Layout
    marginLeft: Layout.spacing.xs, // Optional: Align with input text
  },
});
