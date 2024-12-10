import {
  API_METHOD,
  ApiRequest,
  ApiResponse,
  ApiResult,
  ApiService,
} from '@/data/api';
import { LoginUserResponse } from '@/data/dto/auth';
import { liveStreamApi } from './utils';

const AUTH_API = '/auth';
const LOGIN_API = AUTH_API + '/login';
// const REGISTER_API = AUTH_API + '/register';

export const apiLogin = async (
  emailOrUsername: string,
  password: string
): Promise<ApiResult<LoginUserResponse>> => {
  const requestBody = {
    username: emailOrUsername, // key can be username or email
    password,
  };

  const request: ApiRequest = {
    service: ApiService.liveStream,
    url: LOGIN_API,
    method: API_METHOD.POST,
    data: requestBody,
    authToken: false,
  };

  const apiResponse: ApiResponse<LoginUserResponse> = await liveStreamApi(
    request
  );
  const { success, data: responseData, errorCode } = apiResponse;

  console.log('abc => ', apiResponse);

  let rp: LoginUserResponse = {} as LoginUserResponse;
  let message = 'An error occurred';
  let code = errorCode ?? 500;

  if (success && responseData) {
    rp = responseData.data;
    message = responseData.message ?? 'Success';
    code = responseData.code ?? 200;
  }

  return {
    data: rp,
    message,
    code,
    error: errorCode,
  };
};
