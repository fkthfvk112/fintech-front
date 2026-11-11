export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  error?: string;
}

export enum CRUDStateEnum {
  CREATE_SUCCESS = "CREATE_SUCCESS",
  CREATE_FAIL = "CREATE_FAIL",
  READ_SUCCESS = "READ_SUCCESS",
  READ_FAIL = "READ_FAIL",
  UPDATE_SUCCESS = "UPDATE_SUCCESS",
  UPDATE_FAIL = "UPDATE_FAIL",
  DELETE_SUCCESS = "DELETE_SUCCESS",
  DELETE_FAIL = "DELETE_FAIL",
}
