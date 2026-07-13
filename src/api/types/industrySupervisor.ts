// ── Logbook Review Token Response ─────────────────────────────────────────────

export interface ISLogbookActivity {
  _id: string;
  date: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
}

export interface ISStudentInfo {
  _id: string;
  registrationNumber: string;
  session: string;
  itStatus: string;
  passportPhoto?: string;
  department: { name: string; code: string };
  program: { type: string; level: string };
  itPeriod: { startDate: string; endDate: string; expectedDuration: number };
  placement: {
    company: string;
    position: string;
    department: string;
    startDate: string;
    status: string;
  };
}

export interface ISLogbook {
  _id: string;
  weekNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  activities: ISLogbookActivity[];
  challengesFaced: string;
  lessonsLearned: string;
  nextWeekPlan: string;
  status: "submitted" | "approved" | "rejected" | "draft";
  totalHours: number;
  aiFraudScore?: number;
  createdAt: string;
  updatedAt: string;
  student: ISStudentInfo;
  industrialReview?: {
    reviewedAt: string | null;
    rating: number | null;
    comments: string;
    approvalMethod: string;
  };
}

export interface ISTokenReviewData {
  logbook: ISLogbook;
  student: ISStudentInfo;
  supervisorEmail: string;
  tokenExpiresAt: string;
}

export interface ISTokenReviewResponse {
  success: boolean;
  message: string;
  data: ISTokenReviewData;
}

// Already-used response
export interface ISUsedResponse {
  success: false;
  message: string;
  status: "used";
  usedAt: string;
  action: "approved" | "rejected";
}

// ── Approve / Reject ──────────────────────────────────────────────────────────

export interface ISApprovePayload {
  rating: number; // 1–5
  comments: string;
}

export interface ISApproveResponse {
  success: boolean;
  message: string;
  data: {
    weekNumber: number;
    status: "approved" | "rejected";
    studentName: string;
  };
}

// ── Evaluation ────────────────────────────────────────────────────────────────

/** Flat student shape returned by the evaluation endpoint */
export interface ISEvalStudent {
  name: string;
  registrationNumber: string;
  department: string;
  program: string;
  position: string;
  passportPhoto?: string;
}

export interface ISEvalSummary {
  itDuration: string;
  logbooksSubmitted: number;
  logbooksApproved: number;
  logbooksRejected: number;
  missedWeeks: number[];
  totalHoursLogged: number;
  averageWeeklyRating: number;
  topSkills: string[];
  consistencyRate: number;
}

export interface ISExistingEvaluation {
  ratings: ISEvaluationPayload["ratings"];
  submittedAt: string;
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
  comments: string;
  wouldHire: ISEvaluationPayload["wouldHire"];
  approvalToken?: string;
}

export interface ISEvaluationResponse {
  success: boolean;
  data: {
    student: ISEvalStudent;
    evaluationType: string;
    supervisorEmail?: string;
    tokenExpiresAt: string;
    summary: ISEvalSummary;
    /** Present when this token has already been used to submit */
    existingEvaluation?: ISExistingEvaluation;
  };
}

export interface ISEvaluationPayload {
  ratings: {
    punctuality: number;
    teamwork: number;
    technicalSkills: number;
    communication: number;
    initiative: number;
  };
  strengths: string[];
  weaknesses: string[];
  comments: string;
  wouldHire: "yes" | "no" | "maybe";
}

export interface ISEvaluationSubmitResponse {
  success: boolean;
  message: string;
  data?: {
    studentName: string;
    totalScore: number;
    status: string;
  };
}
