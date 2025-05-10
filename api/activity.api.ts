import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

export interface IActivityHistory {
  serialNo: string;
  activityDate: string;
  activityDetails: string;
  activityNote: string;
  activityStartTime: string;
  activityStopTime: string;
  activityType: string;
  attachmentFile01: [];
  client: string;
  entryNo: string;
  territory: string;
}

type ActivityData = {
  entryTime: string;
  activityTypeList: { code: string; name: string }[];
  clientList: { code: string; name: string }[];
  territoryList: { code: string; name: string }[];
  imagePhoto: Array<any>;
  noOfEntry: string;
  fromDate: string;
  toDate: string;
};

export const useActivityData = (companyId: string) => {
  const [activityData, setActivityData] = useState<ActivityData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.ACTIVITY.INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setActivityData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { activityData, isLoading, error };
};

export const submitActivity = async (data: FormData) => {
  try {
    const req = await axiosIns.post(API_CONSTANTS.ACTIVITY.SUBMIT, data);
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

export const useActivityHistoryInit = (companyId: string) => {
  const [activityData, setActivityData] = useState<ActivityData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.ACTIVITY.HISTORY_INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setActivityData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { activityData, isLoading, error };
};

export const useActivityHistoryList = (
  userId: string,
  sessionId: string,
  companyId?: string,
  employeeCode?: string,
  startDate?: Date,
  endDate?: Date,
  activityType?: string,
  client?: string,
  territory?: string
) => {
  const [activityHistoryList, setActivityHistoryList] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formData = makeFormData({
      sUserID: userId,
      sSessionID: sessionId,
      sCompanyID: companyId,
      sEmployeeCode: employeeCode,
      sFromDate: startDate?.toISOString().split('T')[0],
      sToDate: endDate?.toISOString().split('T')[0],
      sActivityType: activityType,
      sClient: client,
      sTerritory: territory,
    });

    axiosIns
      .post(API_CONSTANTS.ACTIVITY.HISTORY_LIST, formData)
      .then((response) => setActivityHistoryList(response?.data?.detailsList || []))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [
    userId,
    sessionId,
    companyId,
    employeeCode,
    startDate,
    endDate,
    activityType,
    client,
    territory,
  ]);

  return { activityHistoryList, isLoading, error };
};
