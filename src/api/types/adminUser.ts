export interface AdminUserLookupItem {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  registrationNumber?: string;
  phone?: string;
}

export interface AdminUserLookupResponse {
  success: boolean;
  message?: string;
  data: AdminUserLookupItem[];
}

export interface AdminResetPasswordPayload {
  newPassword: string;
}

export interface AdminResetPasswordResponse {
  success: boolean;
  message: string;
}
