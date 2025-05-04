import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

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
      return { success: true, data: req.data };
    }
    return { success: false, message: req.data?.messageDesc };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
