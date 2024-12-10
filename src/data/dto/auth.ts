interface UserResponse {
  id?: string;
  username: string;
  email: string;
  roleType: string;
}

export interface LoginUserResponse extends UserResponse {
  token: string;
}
