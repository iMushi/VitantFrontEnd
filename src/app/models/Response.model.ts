export const enum statusType {
  OK = 'OK',
  ERROR = 'ERROR'
}

export interface ResponseModel<T> {
  data: T[];
  error: string;
  status: statusType;
  accessToken?: string;
}
