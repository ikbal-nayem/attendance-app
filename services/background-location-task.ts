import { sendLocationToServer } from '@/api/location.api';
import { USER_DEVICE_ID } from '@/constants/common';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';
import { getAddressFromCoordinates } from './location';
import { localData } from './storage';

const LOCATION_TASK_NAME = 'background-location-task';

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

      sendLocationToServer(latitude, longitude, deviceId, address);
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
          timeInterval: 600000, // 10 minutes
          deferredUpdatesInterval: 600000, // 10 minutes
          showsBackgroundLocationIndicator: true,
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
