export interface User2FACheckResponse {
  secret: string;
  qr_code: string;
  is2fa_enabled: boolean;
}

export interface User2FAVerityResponse {
  is_verified: boolean;
}

export interface UserInfoUpdateRequest {
  currentPassword?: string;
  newPassword?: string;
  displayName?: string;
  avatarFile?: File | null;
}

export interface UserInfoUpdateResponse {
  username: string;
  display_name: string;
  avatar_file_url: string;
  email: string;
  role_type: string;
}
