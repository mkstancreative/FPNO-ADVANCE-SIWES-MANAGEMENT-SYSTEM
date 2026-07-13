// ─── Company Types ────────────────────────────────────────────────────────────

export type CompanyType = "private" | "public" | "government" | "ngo";
export type VerificationStatus =
  | "pending_verification"
  | "verified"
  | "rejected";

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
}

export interface CompanySupervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface OnboardedBy {
  student: {
    _id: string;
    registrationNumber: string;
    department: {
      name: string;
    };
  };
}

export interface Company { 
  _id: string;
  companyName: string;
  phone: string;
  email: string;
  industry: string;
  companyType: CompanyType;
  address: CompanyAddress;
  verificationStatus: VerificationStatus;
  studentCount?: number;
  currentStudents?: number;
  onboardedBy?: OnboardedBy;
  supervisors?: CompanySupervisor[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Company[];
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface CompanyParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  city?: string;
  status?: VerificationStatus | "";
}

// ─── Verify Payload ───────────────────────────────────────────────────────────

export interface CompanyVerifyEntry {
  companyId: string;
  status: "verified" | "rejected";
  notes?: string;
  editFields?: Partial<
    Omit<Company, "_id" | "createdAt" | "updatedAt" | "__v">
  >;
}

export interface VerifyCompaniesPayload {
  companies: CompanyVerifyEntry[];
}

export interface BulkVerifyResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{
      id?: string;
      companyId?: string;
      placementId?: string;
      error: string;
    }>;
  };
}

// ─── Pending Placements (Partial Verification) ─────────────────────────────────

export interface PendingPlacement {
  _id: string;
  student: {
    _id: string;
    registrationNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    department: {
      name: string;
      code: string;
    };
    program: {
      type: string;
      level: string;
    };
    itPeriod: {
      startDate: string;
      endDate: string;
      expectedDuration: number;
    };
    session: string;
  };
  company: {
    _id: string;
    companyName: string;
    verificationStatus: string;
  };
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  industrialSupervisor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  acceptanceLetterUrl: string;
  status: string;
  createdAt: string;
}

export interface PendingPlacementsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: PendingPlacement[];
}

export interface PlacementVerifyEntry {
  placementId: string;
  status: "verified" | "rejected";
  notes?: string;
}

export interface VerifyPlacementsPayload {
  placements: PlacementVerifyEntry[];
}
