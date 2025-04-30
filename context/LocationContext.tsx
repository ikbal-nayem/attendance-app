import { localData } from '@/services/storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type LocationData = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  address?: string;
};

type LocationContextType = {
  currentLocation: LocationData | null;
  locationPermission: boolean;
  locationErrorMsg: string | null;
  isTracking: boolean;
  locationHistory: LocationData[];
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
  getAddressFromCoordinates: (
    latitude?: number,
    longitude?: number
  ) => Promise<string>;
};

const defaultContext: LocationContextType = {
  currentLocation: null,
  locationPermission: false,
  locationErrorMsg: null,
  isTracking: false,
  locationHistory: [],
  startTracking: async () => {},
  stopTracking: () => {},
  requestLocationPermission: async () => false,
  getAddressFromCoordinates: async () => '',
};

const LocationContext = createContext<LocationContextType>(defaultContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [locationTrackingInterval, setLocationTrackingInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load location history from storage
    const loadLocationHistory = async () => {
      try {
        const storedHistory = await localData.get('locationHistory');
        if (storedHistory) {
          setLocationHistory(storedHistory);
        }
      } catch (error) {
        console.error('Error loading location history:', error);
      }
    };

    loadLocationHistory();
    const checkPermission = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        router.replace('/auth/PermissionRequestScreen');
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

  const saveLocationHistory = async (updatedHistory: LocationData[]) => {
    try {
      await localData.set('locationHistory', updatedHistory);
    } catch (error) {
      console.error('Error saving location history:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        setLocationPermission(false);
        return false;
      }

      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== 'granted') {
          setLocationErrorMsg('Permission for background location was denied');
        }
      }

      setLocationPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationErrorMsg('Error requesting location permission');
      setLocationPermission(false);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
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
  };

  const startTracking = async (): Promise<void> => {
    if (!locationPermission) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) return;
    }

    // Get initial location
    const initialLocation = await getCurrentLocation();
    if (initialLocation) {
      const updatedHistory = [...locationHistory, initialLocation];
      setLocationHistory(updatedHistory);
      saveLocationHistory(updatedHistory);
    }

    // Set up periodic location tracking (every 5 minutes)
    const interval = setInterval(async () => {
      const location = await getCurrentLocation();
      if (location) {
        const updatedHistory = [...locationHistory, location];
        setLocationHistory(updatedHistory);
        saveLocationHistory(updatedHistory);
      }
    }, 10 * 60 * 1000); // 5 minutes

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
        const {
          formattedAddress,
          streetNumber,
          street,
          city,
          region,
          country,
          postalCode,
        } = location[0];

        const addressParts = [
          streetNumber,
          street,
          city,
          region,
          postalCode,
          country,
        ].filter(Boolean);
        return formattedAddress || addressParts.join(', ');
      }

      return 'Unknown location';
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return 'Unknown location';
    }
  };

  const value = {
    currentLocation,
    locationPermission,
    locationErrorMsg,
    isTracking,
    locationHistory,
    startTracking,
    stopTracking,
    requestLocationPermission,
    getAddressFromCoordinates,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
