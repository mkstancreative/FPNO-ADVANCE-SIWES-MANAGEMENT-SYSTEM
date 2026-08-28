export interface AdminUserLookupItem {
  userId?: string;
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  registrationNumber?: string | null;
  phone?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  canReset?: boolean;
}

export interface AdminUserLookupResponse {
  success: boolean;
  count?: number;
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
