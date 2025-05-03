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
import { Camera, ChevronDown, FileText, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

export default function AttendanceScreen() {
  const { user } = useAuth();
  const { currentLocation, getAddressFromCoordinates, requestLocationPermission } =
    useLocation();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [address, setAddress] = useState('Fetching location...');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('W');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attendanceData, isLoading } = useAttendanceData(
    user?.companyID || '',
    user?.employeeCode || ''
  );

  const todayEntries = [];
  const entryNumber = todayEntries.length;

  useEffect(() => {
    const initialize = async () => {
      await requestLocationPermission();

      if (currentLocation) {
        const locationAddress = await getAddressFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setAddress(locationAddress);
      }
    };

    initialize();
  }, [currentLocation]);

  const takePicture = async () => {
    const { status } = await requestCameraPermission();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    setShowCamera(true);
  };

  const handleCapture = async (camera: any) => {
    if (camera) {
      try {
        const photo = await camera.takePictureAsync();
        setCapturedPhoto(photo.uri);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === 'front' ? 'back' : 'front'));
  };

  const handleCheckIn = async () => {
    if (!capturedPhoto) {
      Alert.alert('Missing Photo', 'Please take a photo before checking in');
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        'Location Unavailable',
        'Please wait for your location to be determined'
      );
      return;
    }

    // setIsSubmitting(true);

    // try {
    //   const success = await checkIn(
    //     capturedPhoto,
    //     note,
    //     status as 'Work Day' | 'Off Day'
    //   );

    //   if (success) {
    //     Alert.alert('Success', 'You have successfully checked in');
    //     setCapturedPhoto(null);
    //     setNote('');
    //   } else {
    //     Alert.alert('Error', 'Failed to check in. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error during check-in:', error);
    //   Alert.alert('Error', 'Failed to check in');
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const handleCheckOut = async () => {
    if (!capturedPhoto) {
      Alert.alert('Missing Photo', 'Please take a photo before checking out');
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        'Location Unavailable',
        'Please wait for your location to be determined'
      );
      return;
    }

    // setIsSubmitting(true);

    // try {
    //   const success = await checkOut(capturedPhoto, note);

    //   if (success) {
    //     Alert.alert('Success', 'You have successfully checked out');
    //     setCapturedPhoto(null);
    //     setNote('');
    //   } else {
    //     Alert.alert('Error', 'Failed to check out. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error during check-out:', error);
    //   Alert.alert('Error', 'Failed to check out');
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={cameraType}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={(e) => handleCapture(e.target)}
            >
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

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader title="Attendance" withBackButton={false} bg="primary" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="elevated" style={styles.attendanceCard}>
          <Text style={styles.attendanceTitle}>Entry {entryNumber}</Text>

          {/* {isCheckedIn && (
            <View style={styles.checkinInfo}>
              <Text style={styles.checkinInfoLabel}>Checked in at:</Text>
              <Text style={styles.checkinInfoValue}>
                {formatTime(new Date(currentEntry?.checkInTime || Date.now()))}
              </Text>
            </View>
          )} */}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationInputContainer}>
              <MapPin
                size={20}
                color={Colors.light.subtext}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                {address}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Face Photo</Text>
            <TouchableOpacity style={styles.photoButton} onPress={takePicture}>
              {capturedPhoto ? (
                <Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={24} color={Colors.light.primary} />
                  <Text style={styles.photoPlaceholderText}>Take Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Note"
            placeholder="Add a note (optional)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            leftIcon={<FileText size={20} color={Colors.light.subtext} />}
          />

          <Select
            label="Status"
            options={attendanceData?.entryTypeList ?? []}
            keyProp="code"
            valueProp="name"
            value={status}
            onChange={setStatus}
          />

          <Button
            title={'Check In'}
            onPress={handleCheckIn}
            loading={isSubmitting}
            fullWidth
            style={styles.actionButton}
          />
        </Card>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/enquiry/attendance-history')}
        >
          <Text style={styles.historyButtonText}>View Attendance History</Text>
          <ChevronDown size={18} color={Colors.light.primary} />
        </TouchableOpacity>
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
  backButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Layout.spacing.l,
  },
  attendanceCard: {
    marginBottom: Layout.spacing.m,
  },
  attendanceTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  checkinInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.m,
  },
  checkinInfoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginRight: Layout.spacing.xs,
  },
  checkinInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
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
    height: Layout.inputHeight,
    paddingHorizontal: Layout.spacing.m,
  },
  locationIcon: {
    marginRight: Layout.spacing.s,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
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
  actionButton: {
    marginTop: Layout.spacing.m,
  },
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  historyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginRight: Layout.spacing.xs,
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
});
