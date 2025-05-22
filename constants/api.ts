export const API_CONSTANTS = {
  BASE_URL: 'http://195.229.199.67:59082/srvsat/webapi',
  AUTH: {
    SIGN_IN: '/SignInService/signInProcess',
    LOG_OUT: '/SignOutService/signOutProcess',
    UPDATE_PROFILE: '/SignInService/profileUpdate',
    REGISTER_REQUEST: '/RegistrationService/registrationRequest',
    REGISTER_SUBMIT: '/RegistrationService/registrationSubmit',
  },
  USER_IMAGE: '/SignInService/userImage',

  ATTENDANCE: {
    INIT: '/AttendanceEntryService/firstLoad',
    SUBMIT: '/AttendanceEntryService/attendanceEntry',
    HISTORY_INIT: '/EnquiryAttendanceService/firstLoad',
    HISTORY_LIST: '/EnquiryAttendanceService/attendanceEnquiry',
    HISTORY_DETAILS: '/EnquiryAttendanceService/attendanceDataView',
  },
  ACTIVITY: {
    INIT: '/ActivityEntryService/firstLoad',
    SUBMIT: '/ActivityEntryService/activityEntry',
    HISTORY_INIT: '/EnquiryActivityService/firstLoad',
    HISTORY_LIST: '/EnquiryActivityService/activityEnquiry',
    HISTORY_DETAILS: '/EnquiryActivityService/activityDataView',
  },
  SITE_VISIT: {
    INIT: '/SiteVisitService/firstLoad',
    TERRITORY_STATUS: '/SiteVisitService/siteVisitStatus',
    SUBMIT: '/SiteVisitService/siteVisitEntry',
  },
  NOTIFICATION: {
    INIT: '/PushNotificationService/firstLoad',
    SUBMIT: '/PushNotificationService/pushNotificationEntry',
    LIST: '/ViewNotificationService/pushNotificationData',
    MARK_AS_READ: '/ViewNotificationService/pushNotificationRead',
    HISTORY_INIT: '/EnquiryNotificationService/firstLoad',
    HISTORY_LIST: '/EnquiryNotificationService/pushNotificationEnquiry',
    HISTORY_DETAILS: '/EnquiryNotificationService/pushNotificationData',
  },
  LOACTION: {
    INIT: '/LiveTrackingService/firstLoad',
    LIVE_TRACKING: '/LiveTrackingService/liveTracking',
    SEND_LOCATION: '/StaffTrackingService/staffTracking',
  },
  TERRITORY: {
    INIT: '/EnquiryTerritoryHistoryService/firstLoad',
    HISTORY_LIST: '/EnquiryTerritoryHistoryService/territoryHistory',
  },
};
