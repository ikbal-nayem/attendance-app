import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { isNull } from '@/utils/validation';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';
import { generateRequestDate } from '@/utils/date-time';

type AttendanceData = {
  entryTime: string;
  entryTypeList: { code: string; name: string }[];
  imagePhoto: Array<any>;
  noOfEntry: string;
};

type AttendanceHistoryData = {
  fromDate: string;
  toDate: string;
  entryTypeList: { code: string; name: string }[];
};

export interface IAttendanceHistory {
  attachmentFile01: [];
  serialNo: string;
  attendanceFlag: string;
  attendanceNote: string;
  entryLocation: string;
  entryNo: string;
  entryType: string;
  entryTime: string;
}

export interface IAttendanceHistoryDetails {
  checkInOutFlag: string;
  checkInOutLocation: string;
  checkInOutNote: string;
  checkInOutTime: string;
  checkInOutType: string;
  attachmentBase64File01: string;
}

export const useAttendanceData = (companyId: string, employeeCode: string) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(
        API_CONSTANTS.ATTENDANCE.INIT,
        makeFormData({ sCompanyID: companyId, sEmployeeCode: employeeCode })
      )
      .then((response) => setAttendanceData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { attendanceData, isLoading, error };
};

export const submitAttendance = async (data: FormData) => {
  try {
    const req = await axiosIns.post(API_CONSTANTS.ATTENDANCE.SUBMIT, data);
    if (req.data?.messageCode === '0') {
      return { success: true, data: req.data };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const useAttendanceHistoryInit = (companyId: string) => {
  const [attendanceHistoryData, setAttendanceHistoryData] = useState<AttendanceHistoryData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.ATTENDANCE.HISTORY_INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setAttendanceHistoryData(response?.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { attendanceHistoryData, isLoading, error };
};

export const useAttendanceHistoryList = (
  userId: string,
  sessionId: string,
  companyId: string,
  employeeCode: string,
  startDate?: Date,
  endDate?: Date,
  entryType?: string
) => {
  const [attendanceHistoryList, setAttendanceHistoryList] = useState<IAttendanceHistory[]>([]);
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
      sEntryType: entryType || '',
    });

    axiosIns
      .post(API_CONSTANTS.ATTENDANCE.HISTORY_LIST, formData)
      .then((response) => {
        response.data?.messageCode === '0'
          ? setAttendanceHistoryList(response?.data?.detailsList || [])
          : setError(response?.data?.messageDesc);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [userId, sessionId, companyId, employeeCode, startDate, endDate, entryType]);

  return { attendanceHistoryList, isLoading, error };
};

export const useAttendanceDetails = (
  companyID: string,
  userID: string,
  sessionID: string,
  employeeCode: string,
  entryNo: string
) => {
  const [attendanceDetails, setAttendanceDetails] = useState<IAttendanceHistoryDetails>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    axiosIns
      .post(
        API_CONSTANTS.ATTENDANCE.HISTORY_DETAILS,
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
          ? setAttendanceDetails(response.data?.viewList?.[0])
          : setError(response.data?.messageDesc)
      )
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyID, userID, sessionID, employeeCode, entryNo]);

  return { attendanceDetails, isLoading, error };
};
