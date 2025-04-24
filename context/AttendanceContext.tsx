import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './LocationContext';

export type AttendanceEntry = {
  id: string;
  entryNumber: number;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  checkInLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  checkInPhoto: string;
  checkOutPhoto?: string;
  checkInNote?: string;
  checkOutNote?: string;
  status: 'Work Day' | 'Off Day';
};

type AttendanceContextType = {
  attendanceHistory: AttendanceEntry[];
  currentEntry: AttendanceEntry | null;
  isCheckedIn: boolean;
  checkIn: (photo: string, note?: string, status?: 'Work Day' | 'Off Day') => Promise<boolean>;
  checkOut: (photo: string, note?: string) => Promise<boolean>;
  getTodayEntries: () => AttendanceEntry[];
  getAttendanceByDateRange: (startDate: Date, endDate: Date) => AttendanceEntry[];
};

const defaultContext: AttendanceContextType = {
  attendanceHistory: [],
  currentEntry: null,
  isCheckedIn: false,
  checkIn: async () => false,
  checkOut: async () => false,
  getTodayEntries: () => [],
  getAttendanceByDateRange: () => [],
};

const AttendanceContext = createContext<AttendanceContextType>(defaultContext);

// Sample attendance history
const sampleAttendance: AttendanceEntry[] = [
  {
    id: '1',
    entryNumber: 1,
    date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(9, 0, 0),
    checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17, 30, 0),
    checkInLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
    },
    checkOutLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
    },
    checkInPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    checkOutPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    checkInNote: 'Started work day',
    checkOutNote: 'Completed tasks for the day',
    status: 'Work Day',
  },
  {
    id: '2',
    entryNumber: 1,
    date: new Date(new Date().setDate(new Date().getDate() - 2)), // Two days ago
    checkInTime: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(8, 45, 0),
    checkOutTime: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(16, 15, 0),
    checkInLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
    },
    checkOutLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
    },
    checkInPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    checkOutPhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    checkInNote: 'Started work day',
    checkOutNote: 'Completed tasks for the day',
    status: 'Work Day',
  },
];

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<AttendanceEntry | null>(null);
  const { currentLocation, getAddressFromCoordinates } = useLocation();

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const storedAttendance = await AsyncStorage.getItem('attendanceHistory');
        
        if (storedAttendance) {
          // Parse stored attendance and convert date strings back to Date objects
          const parsed = JSON.parse(storedAttendance);
          const attendanceWithDateObjects = parsed.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
            checkInTime: new Date(entry.checkInTime),
            checkOutTime: entry.checkOutTime ? new Date(entry.checkOutTime) : undefined,
          }));
          
          setAttendanceHistory(attendanceWithDateObjects);
          
          // Check if there's an ongoing attendance entry (checked in but not checked out)
          const ongoing = attendanceWithDateObjects.find(
            (entry: AttendanceEntry) => !entry.checkOutTime && isSameDay(new Date(entry.date), new Date())
          );
          
          if (ongoing) {
            setCurrentEntry(ongoing);
          }
        } else {
          // Load sample attendance if none exists
          setAttendanceHistory(sampleAttendance);
          await AsyncStorage.setItem('attendanceHistory', JSON.stringify(sampleAttendance));
        }
      } catch (error) {
        console.error('Error loading attendance history:', error);
      }
    };

    loadAttendance();
  }, []);

  const saveAttendance = async (updatedAttendance: AttendanceEntry[]) => {
    try {
      await AsyncStorage.setItem('attendanceHistory', JSON.stringify(updatedAttendance));
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getTodayEntries = (): AttendanceEntry[] => {
    const today = new Date();
    return attendanceHistory.filter(entry => isSameDay(new Date(entry.date), today));
  };

  const getAttendanceByDateRange = (startDate: Date, endDate: Date): AttendanceEntry[] => {
    return attendanceHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const checkIn = async (
    photo: string,
    note?: string,
    status: 'Work Day' | 'Off Day' = 'Work Day'
  ): Promise<boolean> => {
    if (!currentLocation) {
      return false;
    }
    
    try {
      // Get location address
      const address = await getAddressFromCoordinates(
        currentLocation.latitude,
        currentLocation.longitude
      );
      
      // Get today's entries to determine the entry number
      const todayEntries = getTodayEntries();
      const entryNumber = todayEntries.length + 1;
      
      // Create new attendance entry
      const newEntry: AttendanceEntry = {
        id: Date.now().toString(),
        entryNumber,
        date: new Date(),
        checkInTime: new Date(),
        checkInLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address,
        },
        checkInPhoto: photo,
        checkInNote: note,
        status,
      };
      
      // Update state and storage
      const updatedHistory = [...attendanceHistory, newEntry];
      setAttendanceHistory(updatedHistory);
      setCurrentEntry(newEntry);
      await saveAttendance(updatedHistory);
      
      return true;
    } catch (error) {
      console.error('Error during check-in:', error);
      return false;
    }
  };

  const checkOut = async (photo: string, note?: string): Promise<boolean> => {
    if (!currentEntry || !currentLocation) {
      return false;
    }
    
    try {
      // Get location address
      const address = await getAddressFromCoordinates(
        currentLocation.latitude,
        currentLocation.longitude
      );
      
      // Update the current entry with check-out information
      const updatedEntry: AttendanceEntry = {
        ...currentEntry,
        checkOutTime: new Date(),
        checkOutLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address,
        },
        checkOutPhoto: photo,
        checkOutNote: note,
      };
      
      // Update state and storage
      const updatedHistory = attendanceHistory.map(entry =>
        entry.id === currentEntry.id ? updatedEntry : entry
      );
      
      setAttendanceHistory(updatedHistory);
      setCurrentEntry(null);
      await saveAttendance(updatedHistory);
      
      return true;
    } catch (error) {
      console.error('Error during check-out:', error);
      return false;
    }
  };

  const value = {
    attendanceHistory,
    currentEntry,
    isCheckedIn: !!currentEntry,
    checkIn,
    checkOut,
    getTodayEntries,
    getAttendanceByDateRange,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendance = () => useContext(AttendanceContext);