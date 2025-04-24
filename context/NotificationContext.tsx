import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  sender?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  media?: string[];
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  sendNotification: (to: string[], subject: string, message: string, media?: string[]) => Promise<boolean>;
};

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  sendNotification: async () => false,
};

const NotificationContext = createContext<NotificationContextType>(defaultContext);

// Sample notifications data
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Offer Acceptance',
    message: 'We welcomed Sophia Anderson to our team as a Network Administrator.',
    date: new Date('2024-01-12T11:20:00'),
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Birthday Celebration',
    message: 'Wishing Melissa Morillo a fantastic birthday! Join in celebrating and making their day special',
    date: new Date('2024-01-12T13:10:00'),
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Training Reminder',
    message: 'A reminder for the training session scheduled tomorrow',
    date: new Date('2024-01-11T09:00:00'),
    read: true,
    type: 'warning',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          // Parse stored notifications and convert date strings back to Date objects
          const parsed = JSON.parse(storedNotifications);
          const notificationsWithDateObjects = parsed.map((n: any) => ({
            ...n,
            date: new Date(n.date),
          }));
          setNotifications(notificationsWithDateObjects);
        } else {
          // Load sample notifications if none exist
          setNotifications(sampleNotifications);
          await AsyncStorage.setItem('notifications', JSON.stringify(sampleNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const saveNotifications = async (updatedNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      date: new Date(),
      read: false,
      ...notification,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const sendNotification = async (
    to: string[],
    subject: string,
    message: string,
    media?: string[]
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add notification to the sender's list as a confirmation
    addNotification({
      title: `Sent: ${subject}`,
      message: `To: ${to.join(', ')}\n\n${message}`,
      type: 'info',
      media,
    });
    
    return true;
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);