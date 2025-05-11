import { USER_DEVICE_ID } from '@/constants/common';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { API_CONSTANTS } from '../constants/api';
import { localData } from './storage';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_UPLOAD_URL = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.LOACTION.SEND_LOCATION}`;

const getAddressFromCoordinates = async (
  latitude?: number,
  longitude?: number
): Promise<string> => {
  if (!latitude || !longitude) return 'Unknown location';
  try {
    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (location && location.length > 0) {
      const { formattedAddress, streetNumber, street, city, region, country, postalCode } =
        location[0];

      const addressParts = [streetNumber, street, city, region, postalCode, country].filter(
        Boolean
      );
      return formattedAddress || addressParts.join(', ');
    }

    return 'Unknown location';
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return 'Unknown location';
  }
};

// Define the task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
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

      console.log('Background location received:', { latitude, longitude, deviceId });

      try {
        const response = await fetch(LOCATION_UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'maltipart/form-data',
          },
          body: JSON.stringify({
            latitude,
            longitude,
            sDeviceID: deviceId,
            sLocation: address,
          }),
        });

        if (response.ok) {
          console.log('Location uploaded successfully:', await response.json());
        } else {
          console.error('Failed to upload location:', response.status, await response.text());
        }
      } catch (err) {
        console.error('Error uploading location:', err);
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
          timeInterval: 600000, // 10 minutes
          deferredUpdatesInterval: 600000, // 10 minutes
          showsBackgroundLocationIndicator: true, // Optional: shows an indicator on iOS
          foregroundService: {
            // Required for Android background location
            notificationTitle: 'Tracking your location',
            notificationBody: 'To ensure accurate attendance and service delivery.',
            notificationColor: '#FF0000', // Optional: notification color
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
