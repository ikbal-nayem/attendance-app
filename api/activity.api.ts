import { API_CONSTANTS } from '@/constants/api';
import { generateRequestDate } from '@/utils/date-time';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { axiosIns } from './config';

export interface IActivityHistory {
  serialNo: string;
  activityDate: string;
  activityDetails: string;
  activityNote: string;
  activityStartTime: string;
  activityStopTime: string;
  activityType: string;
  attachmentFile01: Array<any>;
  client: string;
  contactPerson: string;
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
    if (!startDate || !endDate) return;

    const formData = makeFormData({
      sUserID: userId,
      sSessionID: sessionId,
      sCompanyID: companyId,
      sEmployeeCode: employeeCode,
      sFromDate: generateRequestDate(startDate),
      sToDate: generateRequestDate(endDate),
      sActivityType: activityType || '',
      sClient: client || '',
      sTerritory: territory || '',
    });

    axiosIns
      .post(API_CONSTANTS.ACTIVITY.HISTORY_LIST, formData)
      .then((response) => {
        response.data?.messageCode === '0'
          ? setActivityHistoryList(response?.data?.detailsList || [])
          : setError(response?.data?.messageDesc);
      })
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

export const useActivityDetails = (
  companyID: string,
  userID: string,
  sessionID: string,
  employeeCode: string,
  entryNo: string
) => {
  const [activityDetails, setActivityDetails] = useState<IActivityHistory>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    axiosIns
      .post(
        API_CONSTANTS.ACTIVITY.HISTORY_DETAILS,
        makeFormData({
          sCompanyID: companyID,
          sUserID: userID,
          sSessionID: sessionID,
          sEmployeeCode: employeeCode,
          sEntryNo: entryNo,
        })
      )
      .then((response) =>
        response?.data?.messageCode === '0'
          ? setActivityDetails(response.data?.viewList?.[0])
          : setError(response.data?.messageDesc)
      )
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyID, userID, sessionID, employeeCode, entryNo]);

  return { activityDetails, isLoading, error };
};

// Site visit

interface SiteVisitData {
  entryTime: string;
  territoryList: { code: string; name: string }[];
}

export const useSiteVisitData = (companyId: string, employeeCode: string) => {
  const [siteVisitData, setSiteVisitData] = useState<SiteVisitData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(
        API_CONSTANTS.SITE_VISIT.INIT,
        makeFormData({ sCompanyID: companyId, sEmployeeCode: employeeCode })
      )
      .then((response) => setSiteVisitData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { siteVisitData, isLoading, error };
};

export const checkSiteVisitStatus = async (
  sCompanyID: string,
  sEmployeeCode: string,
  sTerritory: string
) => {
  const formData = makeFormData({
    sCompanyID: sCompanyID,
    sEmployeeCode: sEmployeeCode,
    sTerritory: sTerritory,
  });
  try {
    const req = await axiosIns.post(API_CONSTANTS.SITE_VISIT.TERRITORY_STATUS, formData);
    return req.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const submitSiteVisit = async (data: FormData) => {
  try {
    const req = await axiosIns.post(API_CONSTANTS.SITE_VISIT.SUBMIT, data);
    if (req.data?.messageCode === '0') {
      return { success: true, message: req.data?.messageDesc };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    Alert.alert('Error', JSON.stringify(err));
  }
};
