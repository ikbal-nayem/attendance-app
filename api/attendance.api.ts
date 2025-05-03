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
    const req1 = axiosIns.post(
      API_CONSTANTS.ATTENDANCE.INIT,
      makeFormData({ sCompanyID: companyId })
    );
    const req2 = axiosIns.post(
      API_CONSTANTS.ATTENDANCE.DATA,
      makeFormData({ sCompanyID: companyId, sStaffID: staffId })
    );
    Promise.all([req1, req2])
      .then(([response1, response2]) => {
        setAttendanceData({ ...response1.data, ...response2.data });
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { attendanceData, isLoading, error };
};
