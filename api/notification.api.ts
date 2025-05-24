import { API_CONSTANTS } from '@/constants/api';
import { generateRequestDate } from '@/utils/date-time';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

type NotificationData = {
  messageToList: Array<{ code: string; name: string }>;
};

type NotificationHistoryData = {
  fromDate: string;
  toDate: string;
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

export const markAsRead = async (data: FormData) => {
  try {
    const req = await axiosIns.post(API_CONSTANTS.NOTIFICATION.MARK_AS_READ, data);
    if (req.data?.messageCode === '0') {
      return { success: true, message: req.data?.messageDesc };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useNotificationHistoryInit = (companyId: string) => {
  const [notificationHistoryData, setNotificationHistory] = useState<NotificationHistoryData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(
        API_CONSTANTS.NOTIFICATION.HISTORY_INIT,
        makeFormData({
          sCompanyID: companyId,
        })
      )
      .then((response) => setNotificationHistory(response.data || []))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { notificationHistoryData, isLoading, error };
};

export const useNotificationHistoryList = (
  userId: string,
  sessionId: string,
  companyId: string,
  employeeCode: string,
  sFromDate?: Date,
  sToDate?: Date
) => {
  const [notificationHistoryList, setNotificationHistory] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sFromDate || !sToDate) return;
    axiosIns
      .post(
        API_CONSTANTS.NOTIFICATION.HISTORY_LIST,
        makeFormData({
          sCompanyID: companyId,
          sUserID: userId,
          sSessionID: sessionId,
          sEmployeeCode: employeeCode,
          sFromDate: generateRequestDate(sFromDate),
          sToDate: generateRequestDate(sToDate),
        })
      )
      .then((response) => {
        response.data?.messageCode === '0'
          ? setNotificationHistory(response?.data?.detailsList || [])
          : setError(response?.data?.messageDesc);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId, userId, sessionId, employeeCode, sFromDate, sToDate]);

  return { notificationHistoryList, isLoading, error };
};

export const useNotificationDetails = (
  companyID: string,
  userID: string,
  sessionID: string,
  referenceNo: string
) => {
  const [notificationDetails, setNotificationDetails] = useState<INotification>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    axiosIns
      .post(
        API_CONSTANTS.NOTIFICATION.HISTORY_DETAILS,
        makeFormData({
          sCompanyID: companyID,
          sUserID: userID,
          sSessionID: sessionID,
          sReferenceNo: referenceNo,
        })
      )
      .then((response) =>
        response?.data?.messageCode === '0'
          ? setNotificationDetails(response.data?.viewList?.[0])
          : setError(response.data?.messageDesc)
      )
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyID, userID, sessionID, referenceNo]);

  return { notificationDetails, isLoading, error };
};
