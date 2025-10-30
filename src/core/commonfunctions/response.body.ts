import { ApiResponse } from "./api.response";
import { ResponseUtils } from "./response.utils";

export function responseBody<T = any>(
  status: number,
  message: string,
  data?: T,
  token?: string,
  error?: string,
): ApiResponse<T> {
  if (status >= 200 && status < 300) {
    return ResponseUtils.success(data, message, status);
  } else {
    return ResponseUtils.error(status, message, error);
  }
}