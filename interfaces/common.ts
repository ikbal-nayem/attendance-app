interface IObject {
  [key: string]: any;
}

interface IResponse {
  messageCode: '0' | '1',
  messageDesc: string,
}