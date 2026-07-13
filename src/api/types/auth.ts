// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole =
  | "student"
  | "admin"
  | "coordinator"
  | "school_supervisor";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

// ─── Request Payloads ─────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  registrationNumber: string;
  departmentName: string;
}

// ─── Get Me (full profile) ───────────────────────────────────────────────────
export interface MeUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface MeDepartment {
  name: string;
  code: string;
}

export interface MeProgram {
  type: string;
  level: string;
}

export interface MeITPeriod {
  startDate: string;
  endDate: string;
  expectedDuration: number;
}

export interface MeCompanyAddress {
  street: string;
  city: string;
  state: string;
}

export interface MeCompany {
  _id: string;
  companyName: string;
  phone: string;
  address: MeCompanyAddress;
}

export interface MePlacement {
  company: MeCompany;
  position: string;
  department: string;
  startDate: string;
  acceptanceLetterUrl: string;
  status: "pending" | "verified" | "rejected";
}

export interface MeSchoolSupervisor {
  _id: string;
  staffId: string;
  department: string;
  specialization: string;
}

export interface MeIndustrialSupervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface MeSupervisors {
  school?: MeSchoolSupervisor;
  industrial?: MeIndustrialSupervisor;
}

export interface MeGuarantor {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface MeBatch {
  _id: string;
  name: string;
  session: string;
}

export interface MeProfile {
  _id: string;
  registrationNumber: string;
  session: string;
  itStatus: "active" | "completed" | "inactive";
  passportPhoto?: string;
  department: MeDepartment;
  program: MeProgram;
  itPeriod?: MeITPeriod;
  placement?: MePlacement;
  supervisors?: MeSupervisors;
  guarantor?: MeGuarantor;
  batch?: MeBatch;
  createdAt: string;
  updatedAt: string;
}

export interface GetMeResponse {
  success: boolean;
  data: {
    user: MeUserInfo;
    profile: MeProfile;
  };
}
