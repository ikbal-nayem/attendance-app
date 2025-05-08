import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
  sendNotification: (
    to: string[],
    subject: string,
    message: string,
    media?: string[]
  ) => Promise<boolean>;
};

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  sendNotification: async () => false,
};

const NotificationContext = createContext<NotificationContextType>(defaultContext);

// Sample notifications data

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
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const sendNotification = async (
    to: string[],
    subject: string,
    message: string,
    media?: string[]
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return true;
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const value = {
    notifications,
    unreadCount,
    sendNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);
