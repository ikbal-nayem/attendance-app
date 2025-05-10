import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

export interface IUserLocationData {
  userId: string;
  userName: string;
  imageUrl?: string; // Added for user image
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
    userName: 'John Doe',
    imageUrl: 'https://i.pravatar.cc/150?u=john.doe', // Placeholder image
    location: { latitude: 23.780887, longitude: 90.419945, timestamp: Date.now() - 1000 * 60 * 5 }, // 5 mins ago
  },
  {
    userId: '2',
    userName: 'Jane Smith',
    imageUrl: 'https://i.pravatar.cc/150?u=jane.smith', // Placeholder image
    location: { latitude: 23.781992, longitude: 90.420012, timestamp: Date.now() - 1000 * 60 * 2 }, // 2 mins ago
  },
  {
    userId: '3',
    userName: 'Alice Johnson',
    imageUrl: 'https://i.pravatar.cc/150?u=alice.johnson', // Placeholder image
    location: { latitude: 23.780500, longitude: 90.418500, timestamp: Date.now() - 1000 * 60 * 10 }, // 10 mins ago
  },
  {
    userId: '4',
    userName: 'Bob Williams',
    // No image for this user to test fallback
    location: { latitude: 23.782500, longitude: 90.421500, timestamp: Date.now() - 1000 * 60 * 1 }, // 1 min ago
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

// export const useLiveTracking = (companyId: string) => {
//   const [trackingList, setTrackingList] = useState<ITrackingList>();
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     axiosIns
//       .post(API_CONSTANTS.LOACTION.LIVE_TRACKING, makeFormData({ sCompanyID: companyId }))
//       .then((response) => setTrackingList(response.data))
//       .catch((err) => {
//         console.log(err);
//         setError(err.message);
//       })
//       .finally(() => setIsLoading(false));
//   }, [companyId]);

//   return { trackingList, isLoading, error };
// };
