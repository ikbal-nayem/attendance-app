import { API_CONSTANTS } from '@/constants/api';
import axios from 'axios';

const axiosIns = axios.create({
  baseURL: API_CONSTANTS.BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

axiosIns.interceptors.response.use(
  (res)=>{return res},
  (error) => {
    if(error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access:', data);
      } else if (status === 500) {
        // Handle server error
        console.error('Server error:', data);
        return Promise.reject(new Error('Server error, please try again later.'));
      }
    }
  }
)

export { axiosIns };
