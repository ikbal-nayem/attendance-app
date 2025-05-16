import { axiosIns } from '@/api/config';
import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type NotificationContextType = {
  notifications: INotification[];
  unreadCount: number;
};

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
};

const NotificationContext = createContext<NotificationContextType>(defaultContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Array<INotification>>([]);
  const { user } = useAuth();

  useEffect(() => {
    const getNotifications = async () => {
      axiosIns
        .post(
          API_CONSTANTS.NOTIFICATION.LIST,
          makeFormData({
            sUserID: user?.userID,
            sSessionID: user?.sessionID,
            sCompanyID: user?.companyID,
            sEmployeeCode: user?.employeeCode,
          })
        )
        .then((response) => setNotifications(response.data || []))
        .catch((err) => console.log(err));
    };
    // getNotifications();
    const interval = setInterval(getNotifications, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const unreadCount = notifications?.length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
