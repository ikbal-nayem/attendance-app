interface IObject {
  [key: string]: any;
}

interface IResponse {
  messageCode: '0' | '1';
  messageDesc: string;
}

interface INotification {
  messageDetails: string;
  messageTitle: string;
  referenceDate: string;
  referenceNo: string;
  attachmentFile01: Array<any>;
}
