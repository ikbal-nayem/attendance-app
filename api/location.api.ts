import { API_CONSTANTS } from '@/constants/api';
import { useEffect, useState } from 'react';

const LOCATION_UPLOAD_URL = `${API_CONSTANTS.BASE_URL}${API_CONSTANTS.LOACTION.SEND_LOCATION}`;

export interface IUserLocationData {
  userId: string;
  userName: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

interface ITrackingList {
  entryTime: string;
  activityTypeList: { code: string; name: string }[];
  clientList: { code: string; name: string }[];
  territoryList: { code: string; name: string }[];
  imagePhoto: Array<any>;
  noOfEntry: string;
  fromDate: string;
  toDate: string;
}

// Mock data for live user locations
const mockUserLocations: IUserLocationData[] = [
  {
    userId: '1',
    userName: 'Ikbal',
    imageUrl: 'https://avatars.githubusercontent.com/u/31121811?v=4', // Placeholder image
    location: { latitude: 23.748372, longitude: 90.396734, timestamp: Date.now() - 1000 * 60 * 5 }, // 5 mins ago
  },
  {
    userId: '2',
    userName: 'Mujahid',
    imageUrl: 'https://i.pravatar.cc/150?u=jane.smith', // Placeholder image
    location: { latitude: 23.769999068691877, longitude: 90.4107950519981, timestamp: Date.now() - 1000 * 60 * 2 }, // 2 mins ago
  },
  {
    userId: '3',
    userName: 'Alice Johnson',
    imageUrl: 'https://i.pravatar.cc/150?u=alice.johnson', // Placeholder image
    location: { latitude: 23.75905247216991, longitude: 90.3897508684784, timestamp: Date.now() - 1000 * 60 * 10 }, // 10 mins ago
  },
  {
    userId: '4',
    userName: 'Bob Williams',
    // No image for this user to test fallback
    location: { latitude: 23.78111639688084, longitude: 90.39946244398558, timestamp: Date.now() - 1000 * 60 * 1 }, // 1 min ago
  },
];

export const useFetchUserLiveLocations = () => {
  const [userLocations, setUserLocations] = useState<IUserLocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUserLocations(mockUserLocations);
      setIsLoading(false);
    }, 1500); // Simulate 1.5 second delay
  }, []);

  return { userLocations, isLoading, error };
};

export const sendLocationToServer = async (
  latitude: number,
  longitude: number,
  deviceId: string,
  address: string
) => {
  if (!latitude || !longitude || !deviceId) {
    console.error('[BG_TASK] Missing required parameters for location upload');
    return;
  }
  const formdata = new FormData();
  formdata.append('sLatitude', latitude?.toString());
  formdata.append('sLongitude', longitude?.toString());
  formdata.append('sDeviceID', deviceId);
  formdata.append('sLocation', address);
  try {
    const response = await fetch(LOCATION_UPLOAD_URL, {
      method: 'POST',
      body: formdata,
      headers: {}
    });
    if (response.ok) {
      console.log('[BG_TASK] Location uploaded successfully:', await response.json());
    } else {
      console.error('[BG_TASK] Failed to upload location:', response.status, await response.text());
    }
  } catch (err) {
    console.error('[BG_TASK] Error uploading location:', err);
  }
};
