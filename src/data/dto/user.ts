export interface User2FACheckResponse {
  secret: string;
  qr_code: string;
  is2fa_enabled: boolean;
}

export interface User2FAVerityResponse {
  is_verified: boolean;
}
