import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type LocationData = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  address?: string;
};

export type UserLocation = {
  userId: string;
  userName: string;
  location: LocationData;
};

type LocationContextType = {
  currentLocation: LocationData | null;
  locationPermission: boolean;
  locationErrorMsg: string | null;
  isTracking: boolean;
  locationHistory: LocationData[];
  userLocations: UserLocation[];
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
  getAddressFromCoordinates: (latitude: number, longitude: number) => Promise<string>;
};

const defaultContext: LocationContextType = {
  currentLocation: null,
  locationPermission: false,
  locationErrorMsg: null,
  isTracking: false,
  locationHistory: [],
  userLocations: [],
  startTracking: async () => {},
  stopTracking: () => {},
  requestLocationPermission: async () => false,
  getAddressFromCoordinates: async () => '',
};

const LocationContext = createContext<LocationContextType>(defaultContext);

// Sample user locations for the map
const sampleUserLocations: UserLocation[] = [
  {
    userId: '1',
    userName: 'John Smith',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: Date.now() - 3600000, // 1 hour ago
      accuracy: 10,
    },
  },
  {
    userId: '2',
    userName: 'Sarah Johnson',
    location: {
      latitude: 37.7854,
      longitude: -122.4055,
      timestamp: Date.now() - 1800000, // 30 minutes ago
      accuracy: 15,
    },
  },
  {
    userId: '3',
    userName: 'Michael Chen',
    location: {
      latitude: 37.7946,
      longitude: -122.3999,
      timestamp: Date.now() - 600000, // 10 minutes ago
      accuracy: 8,
    },
  },
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [userLocations, setUserLocations] = useState<UserLocation[]>(sampleUserLocations);
  const [locationTrackingInterval, setLocationTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load location history from storage
    const loadLocationHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('locationHistory');
        if (storedHistory) {
          setLocationHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading location history:', error);
      }
    };

    loadLocationHistory();
    requestLocationPermission();

    return () => {
      if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
      }
    };
  }, []);

  const saveLocationHistory = async (updatedHistory: LocationData[]) => {
    try {
      await AsyncStorage.setItem('locationHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving location history:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        setLocationPermission(false);
        return false;
      }
      
      // Only request background permissions on native platforms
      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          setLocationErrorMsg('Permission for background location was denied');
          // Still allow foreground location
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
    }, 5 * 60 * 1000); // 5 minutes
    
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

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const location = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (location && location.length > 0) {
        const { street, city, region, country, postalCode } = location[0];
        const addressParts = [street, city, region, postalCode, country].filter(Boolean);
        return addressParts.join(', ');
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
    userLocations,
    startTracking,
    stopTracking,
    requestLocationPermission,
    getAddressFromCoordinates,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => useContext(LocationContext);