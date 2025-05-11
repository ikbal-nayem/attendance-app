import { USER_DEVICE_ID } from '@/constants/common';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';
import { API_CONSTANTS } from '../constants/api';
import { getAddressFromCoordinates } from './location';
import { localData } from './storage';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_UPLOAD_URL = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.LOACTION.SEND_LOCATION}`;

// Define the task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    Alert.alert('Background Location', 'Background location task error' + JSON.stringify(error));
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const latestLocation = locations[locations.length - 1];
      const { latitude, longitude } = latestLocation.coords;

      const deviceId = await localData.get(USER_DEVICE_ID);
      const address = await getAddressFromCoordinates(latitude, longitude);

      try {
        const formdata = new FormData();
        formdata.append('sLatitude', latitude?.toString());
        formdata.append('sLongitude', longitude?.toString());
        formdata.append('sDeviceID', deviceId);
        formdata.append('sLocation', address);
        const response = await fetch(LOCATION_UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: formdata,
        });
        Alert.alert('Background Location', JSON.stringify(response));

        if (response.ok) {
          console.log('Location uploaded successfully:', await response.json());
        } else {
          console.error('Failed to upload location:', response.status, await response.text());
        }
      } catch (err) {
        console.error('Error uploading location:', err);
        Alert.alert('Location Upload Error', JSON.stringify(err));
      }
    }
  }
});

// Function to register the background task
export async function registerBackgroundLocationTask() {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // 10 minutes
          deferredUpdatesInterval: 60000, // 10 minutes
          showsBackgroundLocationIndicator: true, // Optional: shows an indicator on iOS
          foregroundService: {
            notificationTitle: 'Tracking your location',
            notificationBody: 'To ensure accurate attendance and service delivery.',
            notificationColor: '#FF0000',
          },
        });
        console.log('Background location task registered');
      } else {
        console.error('Background location permission not granted');
      }
    } else {
      console.error('Foreground location permission not granted');
    }
  } catch (error) {
    console.error('Error registering background location task:', error);
    Alert.alert('Error', 'Background location tracking failed to start' + JSON.stringify(error));
  }
}

// Function to unregister the background task
export async function unregisterBackgroundLocationTask() {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location task unregistered');
  } catch (error) {
    console.error('Error unregistering background location task:', error);
  }
}

// Function to check if the task is registered
export async function isBackgroundLocationTaskRegistered() {
  return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
}
