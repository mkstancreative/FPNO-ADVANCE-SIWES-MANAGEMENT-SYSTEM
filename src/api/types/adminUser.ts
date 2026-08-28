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
  /**
   * Omit to have the backend generate a temporary password and force a change
   * on the user's next login. The key must be absent, not empty — sending
   * `""` would be validated as a password rather than read as "generate one".
   */
  newPassword?: string;
}

export interface AdminResetPasswordResponse {
  success: boolean;
  message: string;
  /**
   * Present only when the backend generated the password. The exact key is
   * unconfirmed, so `readTemporaryPassword` checks the likely spellings rather
   * than betting on one — an admin who cannot read the generated password has
   * just locked the user out.
   */
  temporaryPassword?: string;
  tempPassword?: string;
  password?: string;
  data?: {
    temporaryPassword?: string;
    tempPassword?: string;
    password?: string;
  };
}

/** Pull the generated password out of whichever field carries it. */
export const readTemporaryPassword = (
  res?: AdminResetPasswordResponse | null,
): string | undefined =>
  res?.temporaryPassword ??
  res?.tempPassword ??
  res?.password ??
  res?.data?.temporaryPassword ??
  res?.data?.tempPassword ??
  res?.data?.password;
