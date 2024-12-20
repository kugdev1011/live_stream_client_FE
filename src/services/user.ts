import {
  apiChange2FactorAuth,
  apiFetch2FactorAuth,
  apiUpdateUserInfo,
  apiVerity2FactorAuthWithOTP,
} from '@/api/user';
import { ServiceResponse } from '@/data/api';
import {
  User2FACheckResponse,
  User2FAVerityResponse,
  UserInfoUpdateRequest,
  UserInfoUpdateResponse,
} from '@/data/dto/user';
import { TWO_FA_OTP_CODE_LENGTH } from '@/data/validations';

export enum Verity2FAError {
  INVALID_OTP = 'INVALID_OTP',
  ACTION_FAILURE = 'ACTION_FAILURE',
}

export enum UserInfoUpdateError {
  INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD',
}

export const fetch2FactorAuth = async (): Promise<User2FACheckResponse> => {
  const { data } = await apiFetch2FactorAuth();
  return data;
};

export const verity2FactorAuthWithOTP = async (
  otpCode: string
): Promise<ServiceResponse<User2FAVerityResponse, Verity2FAError>> => {
  const errors: Partial<Record<Verity2FAError, boolean>> = {};
  let otpFailure = false;

  if (!otpCode || otpCode.length !== TWO_FA_OTP_CODE_LENGTH) otpFailure = true;

  let result: User2FAVerityResponse | undefined = undefined;
  let msg: string = '';
  if (!otpFailure) {
    const { data, message, code } = await apiVerity2FactorAuthWithOTP(otpCode);
    if (data && code !== 500) {
      result = { is_verified: data.is_verified };
    } else {
      msg = message;
      if (code === 500) errors[Verity2FAError.INVALID_OTP] = true;
    }
  } else {
    errors[Verity2FAError.INVALID_OTP] = otpFailure;
  }

  return {
    data: result,
    errors: Object.keys(errors).length
      ? (errors as Record<Verity2FAError, boolean>)
      : undefined,
    message: msg,
  };
};

export const change2FactorAuth = async (
  isEnabled: boolean
): Promise<User2FACheckResponse> => {
  const { data } = await apiChange2FactorAuth(isEnabled);
  return data;
};

export const updateUserInfo = async (
  payload: UserInfoUpdateRequest
): Promise<ServiceResponse<UserInfoUpdateResponse, UserInfoUpdateError>> => {
  const errors: Partial<Record<UserInfoUpdateError, boolean>> = {};

  let result: UserInfoUpdateResponse | undefined = undefined;
  let msg: string = '';
  const { data, message, code } = await apiUpdateUserInfo(payload);
  if (data && code !== 500) {
    result = {
      display_name: data.display_name,
      username: data.username,
      email: data.email,
      avatar_file_url: data.avatar_file_url,
      role_type: data.role_type,
    };
  } else {
    msg = message;
    if (code === 500) {
      errors[UserInfoUpdateError.INVALID_CURRENT_PASSWORD] = true;
    }
  }

  return {
    data: result,
    errors: Object.keys(errors).length
      ? (errors as Record<UserInfoUpdateError, boolean>)
      : undefined,
    message: msg,
  };
};
