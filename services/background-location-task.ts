import { sendLocationToServer } from '@/api/location.api';
import { USER_DEVICE_ID } from '@/constants/common';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getAddressFromCoordinates } from './location';
import { localData } from './storage';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[BG_TASK] Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const latestLocation = locations[locations.length - 1];
      const { latitude, longitude } = latestLocation.coords;

      const deviceId = await localData.get(USER_DEVICE_ID);
      const address = await getAddressFromCoordinates(latitude, longitude);

      await sendLocationToServer(latitude, longitude, deviceId, address, latestLocation.timestamp);
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
          accuracy: Location.Accuracy.High,
          timeInterval: 10 * 60 * 1000, // 10 minutes
          activityType: Location.ActivityType.AutomotiveNavigation,
          distanceInterval: 100, // 100 meters
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'IPS SAT',
            notificationBody: 'Background Location tracking service is active',
          },
        });
        console.log('[BG_TASK] Background location task registered');
        return true;
      } else {
        console.error('[BG_TASK] Background location permission not granted');
      }
    } else {
      console.error('[BG_TASK] Foreground location permission not granted');
    }
  } catch (error) {
    console.error('[BG_TASK] Error registering background location task:', error);
  }
}

// Function to unregister the background task
export async function unregisterBackgroundLocationTask() {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('[BG_TASK] Background location task unregistered');
  } catch (error) {
    console.error('[BG_TASK] Error unregistering background location task:', error);
  }
}

// Function to check if the task is registered
export async function isBackgroundLocationTaskRegistered() {
  return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
}
