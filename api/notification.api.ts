import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

type NotificationData = {
  messageToList: Array<{ code: string; name: string }>;
};

export const useNotificationData = (companyId: string) => {
  const [notificationData, setNotificationData] = useState<NotificationData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.NOTIFICATION.INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setNotificationData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { notificationData, isLoading, error };
};

export const sendNotification = async (data: FormData) => {
  try {
    const req = await axiosIns.post(API_CONSTANTS.NOTIFICATION.SUBMIT, data);
    console.log(req.data);
    if (req.data?.messageCode === '0') {
      return { success: true, message: req.data?.messageDesc, data: req.data };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
