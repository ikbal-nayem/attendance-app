export const API_CONSTANTS = {
  BASE_URL: 'http://86.96.193.135/srvsat/webapi',
  AUTH: {
    SIGN_IN: '/SignInService/signInProcess',
    LOG_OUT: '/SignOutService/signOutProcess',
    REGISTER_REQUEST: '/RegistrationService/registrationRequest',
    REGISTER_SUBMIT: '/RegistrationService/registrationSubmit',
  },
  USER_IMAGE: '/SignInService/userImage',

  ATTENDANCE: {
    INIT: '/AttendanceEntryService/firstLoad',
    SUBMIT: '/AttendanceEntryService/attendanceEntry',
    HISTORY_INIT: '/EnquiryAttendanceService/firstLoad',
    HISTORY_LIST: '/EnquiryAttendanceService/attendanceEnquiry',
  },
  ACTIVITY: {
    INIT: '/ActivityEntryService/firstLoad',
    SUBMIT: '/ActivityEntryService/activityEntry',
    HISTORY_INIT: '/EnquiryActivityService/firstLoad',
    HISTORY_LIST: '/EnquiryActivityService/activityEnquiry',
  },
  NOTIFICATION: {
    INIT: '/PushNotificationService/firstLoad',
    SUBMIT: '/PushNotificationService/pushNotificationEntry',
    LIST: '/ViewNotificationService/pushNotificationData',
    MARK_AS_READ: '/ViewNotificationService/pushNotificationRead',
    HISTORY_INIT: '/EnquiryNotificationService/firstLoad',
    HISTORY_DATA_PROCESS: '/EnquiryNotificationService/pushNotificationEnquiry',
    HISTORY_LIST: '/EnquiryNotificationService/pushNotificationData',
  },
};
