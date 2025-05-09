import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';
export interface IActivityHistory {
  id?: string; // Assuming an ID field
  entryDate?: string;
  entryTime?: string;
  exitTime?: string;
  status?: string;
  location?: string;
  description?: string;
  activityType?: string;
  activityNo?: string;
  activityFlag?: string; // e.g., 'C' for Completed, 'I' for Incomplete
  title?: string; // A general title for the activity
  remarks?: string;
  // Add any other fields that are relevant for activity history
}

type ActivityData = {
  entryTime: string;
  activityTypeList: { code: string; name: string }[];
  clientList: { code: string; name: string }[];
  territoryList: { code: string; name: string }[];
  imagePhoto: Array<any>;
  noOfEntry: string;
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
