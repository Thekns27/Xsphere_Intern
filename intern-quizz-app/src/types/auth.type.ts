export interface TokenPayload {
  id: number;
  email: string;
}

export interface LoginPayload {
  password: string;
  email: string;
}

export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

export interface resetPasswordPayload {
  email: string;
  otp: number;
  newPassword: string;
}
