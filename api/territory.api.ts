import { API_CONSTANTS } from '@/constants/api';
import { makeFormData } from '@/utils/form-actions';
import { useEffect, useState } from 'react';
import { axiosIns } from './config';

export interface ITerritotyHistory {
  serialNo: string;
  accessDate: string;
  employeeCode: string;
  employeeName: string;
  inTime: string;
  location: string;
  outTime: string;
  territory: string;
  timeDuration: string;
}

type TerritoryData = {
  employeeList: { code: string; name: string }[];
  territoryList: { code: string; name: string }[];
  fromDate: string;
  toDate: string;
};

export const useTerritoryInit = (companyId: string) => {
  const [territoryData, setTerritoryData] = useState<TerritoryData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosIns
      .post(API_CONSTANTS.TERRITORY.INIT, makeFormData({ sCompanyID: companyId }))
      .then((response) => setTerritoryData(response.data))
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [companyId]);

  return { territoryData, isLoading, error };
};

export const useTerritoryHistoryList = (
  userId: string,
  sessionId: string,
  companyId?: string,
  employeeCode?: string,
  startDate?: Date,
  endDate?: Date,
  client?: string,
  territory?: string
) => {
  const [territoryHistoryList, setTerritoryHistoryList] = useState<ITerritotyHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formData = makeFormData({
      sUserID: userId,
      sSessionID: sessionId,
      sCompanyID: companyId,
      sFromDate: startDate?.toISOString().split('T')[0],
      sToDate: endDate?.toISOString().split('T')[0],
      sEmployeeCode: client,
      sTerritory: territory,
    });

    axiosIns
      .post(API_CONSTANTS.TERRITORY.HISTORY_LIST, formData)
      .then((response) => {
        response.data?.messageCode === '0'
          ? setTerritoryHistoryList(response?.data?.detailsList || [])
          : setError(response?.data?.messageDesc);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [userId, sessionId, companyId, employeeCode, startDate, endDate, client, territory]);

  return { territoryHistoryList, isLoading, error };
};
