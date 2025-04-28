import { API_CONSTANTS } from '@/constants/api';
import axios from 'axios';

const axiosIns = axios.create({
  baseURL: API_CONSTANTS.BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

export { axiosIns };
