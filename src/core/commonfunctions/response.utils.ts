import { message } from "../constants/message.constants";
import { Fstatus } from "../constants/response.code";
import { ApiResponse } from "./api.response";

export class ResponseUtils {
  static success<T>(data?: T, message?: string, status: number = Fstatus.GET_SUCCESS): ApiResponse<T> {
    return {
      status,
      message: message || this.getDefaultSuccessMessage(status),
      data,
    };
  }

  // FIXED: Generic <T> for error - Returns ApiResponse<T> with null data
  static error<T>(status: number, message?: string, error?: string): ApiResponse<T> {
    return {
      status,
      message: message || this.getDefaultErrorMessage(status),
      error,
    } as ApiResponse<T>;  // Cast to ApiResponse<T> to allow null data
  }

  static withToken<T>(data: T, token: string, message?: string): ApiResponse<T> {
    return {
      ...this.success(data, message),
      token,
    };
  }

  private static getDefaultSuccessMessage(status: number): string {
    switch (status) {
      case Fstatus.POST_SUCCESS: return message.REGISTRATION_SUCCESS;
      case Fstatus.GET_SUCCESS: return 'Resource fetched successfully';
      case Fstatus.PATCH_SUCCESS: return message.PROFILE_UPDATED;
      case Fstatus.DELETE_SUCCESS: return message.DELETED_SUCCESS;
      default: return 'Operation successful';
    }
  }

  private static getDefaultErrorMessage(status: number): string {
    switch (status) {
      case Fstatus.BAD_REQUEST: return message.BAD_STATUS;
      case Fstatus.UNAUTHORIZED: return message.INVALID_TOKEN;
      case Fstatus.NOT_FOUND: return message.USER_DOESNT_EXIST;
      case Fstatus.INTERNAL_SERVER_ERROR: return message.INTERNAL_SERVER_ERROR;
      default: return 'An error occurred';
    }
  }
}