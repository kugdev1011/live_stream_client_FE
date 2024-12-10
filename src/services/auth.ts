import { apiLogin } from '@/api/auth';
import { API_ERROR, ServiceResponse } from '@/data/api';
import { LoginUserResponse } from '@/data/dto/auth';
import { authAccount } from '@/data/model/userAccount';

export enum LoginError {
  INVALID_USERNAME = 'INVALID_USERNAME',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
}

export const login = async (
  emailOrUsername: string,
  pwd: string
): Promise<ServiceResponse<LoginUserResponse, LoginError>> => {
  let errors: Partial<Record<LoginError, boolean>> = {};
  let usernameFailure = false,
    passwordFailure = false;
  if (!emailOrUsername) usernameFailure = true;
  if (!pwd) passwordFailure = true;

  let result: LoginUserResponse | undefined = undefined;
  if (!usernameFailure && !passwordFailure) {
    const { data, error } = await apiLogin(emailOrUsername, pwd);
    if (!error && data) {
      errors = {};
      const { id, email, roleType, username, token } = data; // code, message, data

      authAccount(id || '', username, email, roleType, token);
      result = {
        token,
        id,
        username,
        email,
        roleType,
      };
    } else {
      switch (error) {
        case API_ERROR.BLOCKED:
          errors[LoginError.ACCOUNT_BLOCKED] = true;
          break;
        default:
          errors[LoginError.LOGIN_FAILED] = true;
      }
    }
  } else {
    errors[LoginError.INVALID_USERNAME] = usernameFailure;
    errors[LoginError.INVALID_PASSWORD] = passwordFailure;
  }

  return {
    data: result,
    errors: Object.keys(errors).length
      ? (errors as Record<LoginError, boolean>)
      : undefined,
  };
};
