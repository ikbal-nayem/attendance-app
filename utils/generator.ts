import { API_CONSTANTS } from "@/constants/api"

export const generateUserImage = (userId: string, sessionID: string, companyID: string) => {
  return API_CONSTANTS.BASE_URL + API_CONSTANTS.USER_IMAGE + `?sUserID=${userId}&sSessionID=${sessionID}&sCompanyID=${companyID}`
}