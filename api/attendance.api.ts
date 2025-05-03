import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

type AttendanceData = {
  companyID: string;
  companyName: string;
  entryTime: string;
  entryTypeList: { code: string; name: string }[];
  imagePhoto: Array<any>;
  noOfEntry: string;
  sessionID: string;
  userID: string;
  userName: string;
};

export const useAttendanceData = (companyId: string, staffId: string) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(
        API_CONSTANTS.ATTENDANCE.INIT,
        makeFormData({ sCompanyID: companyId, sStaffID: staffId })
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
    console.log(req.data);
    if (req.data?.messageCode === '0') {
      return { success: true, data: req.data };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
