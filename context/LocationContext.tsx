import { sendLocationToServer } from '@/api/location.api';
import { USER_DEVICE_ID } from '@/constants/common';
import {
  isBackgroundLocationTaskRegistered,
  registerBackgroundLocationTask,
} from '@/services/background-location-task';
import { getAddressFromCoordinates } from '@/services/location';
import { localData } from '@/services/storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useToast } from './ToastContext';

export type LocationData = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
};

type LocationContextType = {
  currentLocation: LocationData | null;
  locationPermission: boolean;
  locationErrorMsg: string | null;
  isTracking: boolean;
  locationHistory: LocationData[];
  getCurrentLocation: () => Promise<LocationData | null>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
};

const defaultContext: LocationContextType = {
  currentLocation: null,
  locationPermission: false,
  locationErrorMsg: null,
  isTracking: false,
  locationHistory: [],
  getCurrentLocation: async () => null,
  startTracking: async () => {},
  stopTracking: () => {},
  requestLocationPermission: async () => false,
};

const LocationContext = createContext<LocationContextType>(defaultContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [locationTrackingInterval, setLocationTrackingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const { showToast } = useToast();

  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        router.replace('/permission-request');
      }
    };
    checkPermission();
    startTracking();

    return () => {
      if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
      }
    };
  }, []);

  // useEffect(() => {
  //   const setupBackgroundLocation = async () => {
  //     if (Platform.OS === 'android' || Platform.OS === 'ios') {
  //       const isRegistered = await isBackgroundLocationTaskRegistered();
  //       if (!isRegistered) {
  //         const success = await registerBackgroundLocationTask();
  //         success && showToast({ type: 'info', message: 'Background tracking service activated' });
  //       }
  //     }
  //   };

  //   setTimeout(setupBackgroundLocation, 20 * 1000);
  // }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        setLocationPermission(false);
        return false;
      }

      // if (Platform.OS !== 'web') {
      //   const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      //   if (backgroundStatus !== 'granted') {
      //     setLocationErrorMsg('Permission for background location was denied');
      //   }
      // }

      setLocationPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationErrorMsg('Error requesting location permission');
      setLocationPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }, []);

  const startTracking = async (): Promise<void> => {
    if (!locationPermission) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) return;
    }

    const initialLocation = await getCurrentLocation();
    if (initialLocation) {
      const updatedHistory = [...locationHistory, initialLocation];
      setLocationHistory(updatedHistory);
    }

    // Set up periodic location tracking (every 5 minutes)
    const interval = setInterval(async () => {
      const location = await getCurrentLocation();
      if (location) {
        const updatedHistory = [...locationHistory, location];
        setLocationHistory(updatedHistory);
        // Send location to server
        const deviceId = await localData.get(USER_DEVICE_ID);
        const address = await getAddressFromCoordinates(location.latitude, location.longitude);
        sendLocationToServer(
          location.latitude,
          location.longitude,
          deviceId,
          address,
          location.timestamp
        );
      }
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    setLocationTrackingInterval(interval);
    setIsTracking(true);
  };

  const stopTracking = (): void => {
    if (locationTrackingInterval) {
      clearInterval(locationTrackingInterval);
      setLocationTrackingInterval(null);
    }
    setIsTracking(false);
  };

  const value = {
    currentLocation,
    locationPermission,
    locationErrorMsg,
    isTracking,
    locationHistory,
    getCurrentLocation,
    startTracking,
    stopTracking,
    requestLocationPermission,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => useContext(LocationContext);
