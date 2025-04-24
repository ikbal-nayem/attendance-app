import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Activity = {
  id: string;
  activityType: string;
  client: string;
  territory: string;
  details: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  attachments?: string[];
  note?: string;
  createdAt: Date;
  userId: string;
};

type ActivityContextType = {
  activities: Activity[];
  activityTypes: string[];
  clients: string[];
  territories: string[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<boolean>;
  getActivityById: (id: string) => Activity | undefined;
  getActivitiesByDateRange: (startDate: Date, endDate: Date) => Activity[];
  getActivitiesByFilters: (filters: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    client?: string;
    territory?: string;
  }) => Activity[];
};

const defaultContext: ActivityContextType = {
  activities: [],
  activityTypes: [],
  clients: [],
  territories: [],
  addActivity: async () => false,
  getActivityById: () => undefined,
  getActivitiesByDateRange: () => [],
  getActivitiesByFilters: () => [],
};

const ActivityContext = createContext<ActivityContextType>(defaultContext);

// Dummy data
const activityTypesList = ['Meeting', 'Site Visit', 'Training', 'Client Call', 'Presentation', 'Workshop'];
const clientsList = ['ABC Corp', 'XYZ Industries', 'Tech Solutions', 'Global Systems', 'Innovative Labs'];
const territoriesList = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];

// Sample activities
const sampleActivities: Activity[] = [
  {
    id: '1',
    activityType: 'Meeting',
    client: 'ABC Corp',
    territory: 'North Region',
    details: 'Quarterly review meeting with client team to discuss progress and upcoming milestones.',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    startTime: new Date(new Date().setHours(10, 0, 0)),
    endTime: new Date(new Date().setHours(11, 30, 0)),
    attachments: [
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    ],
    note: 'Follow up needed on action items',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    userId: '1',
  },
  {
    id: '2',
    activityType: 'Site Visit',
    client: 'XYZ Industries',
    territory: 'South Region',
    details: 'Inspection of new facility and equipment installation progress.',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    startTime: new Date(new Date().setHours(14, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0)),
    attachments: [
      'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
    ],
    note: 'Equipment delivery delayed by 1 week',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    userId: '1',
  },
];

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const storedActivities = await AsyncStorage.getItem('activities');
        
        if (storedActivities) {
          // Parse stored activities and convert date strings back to Date objects
          const parsed = JSON.parse(storedActivities);
          const activitiesWithDateObjects = parsed.map((activity: any) => ({
            ...activity,
            date: new Date(activity.date),
            startTime: new Date(activity.startTime),
            endTime: new Date(activity.endTime),
            createdAt: new Date(activity.createdAt),
          }));
          
          setActivities(activitiesWithDateObjects);
        } else {
          // Load sample activities if none exist
          setActivities(sampleActivities);
          await AsyncStorage.setItem('activities', JSON.stringify(sampleActivities));
        }
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    loadActivities();
  }, []);

  const saveActivities = async (updatedActivities: Activity[]) => {
    try {
      await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      const updatedActivities = [...activities, newActivity];
      setActivities(updatedActivities);
      await saveActivities(updatedActivities);
      
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  };

  const getActivityById = (id: string): Activity | undefined => {
    return activities.find(activity => activity.id === id);
  };

  const getActivitiesByDateRange = (startDate: Date, endDate: Date): Activity[] => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  };

  const getActivitiesByFilters = (filters: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    client?: string;
    territory?: string;
  }): Activity[] => {
    return activities.filter(activity => {
      let matches = true;
      
      if (filters.startDate && filters.endDate) {
        const activityDate = new Date(activity.date);
        matches = matches && activityDate >= filters.startDate && activityDate <= filters.endDate;
      }
      
      if (filters.activityType) {
        matches = matches && activity.activityType === filters.activityType;
      }
      
      if (filters.client) {
        matches = matches && activity.client === filters.client;
      }
      
      if (filters.territory) {
        matches = matches && activity.territory === filters.territory;
      }
      
      return matches;
    });
  };

  const value = {
    activities,
    activityTypes: activityTypesList,
    clients: clientsList,
    territories: territoriesList,
    addActivity,
    getActivityById,
    getActivitiesByDateRange,
    getActivitiesByFilters,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivity = () => useContext(ActivityContext);