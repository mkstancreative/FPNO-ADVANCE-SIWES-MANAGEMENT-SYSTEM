import type { SchoolEvaluationRatings } from "./schoolSupervisor";
import type { ISEvaluationPayload } from "./industrySupervisor";

export type EvaluationType = "midterm" | "final";

export interface EvaluationInternshipRef {
  _id: string;
  batch: { _id: string; name: string; session: string };
  session: string;
}

export interface EvaluationSchoolSide {
  ratings: SchoolEvaluationRatings;
  comments: string;
  score: number;
  submittedAt: string;
}

export interface EvaluationIndustrialSide {
  ratings: ISEvaluationPayload["ratings"];
  strengths: string[];
  weaknesses: string[];
  comments: string;
  wouldHire: "yes" | "no" | "maybe";
  score: number;
  submittedAt: string;
}

export interface Evaluation {
  _id: string;
  student: string;
  internship: EvaluationInternshipRef;
  type: EvaluationType;
  school?: EvaluationSchoolSide;
  industrial?: EvaluationIndustrialSide;
  isComplete: boolean;
  finalScore: number | null;
  finalGrade: string | null;
  status: string;
  createdAt: string;
}

// ── GET /evaluations/student/:studentId (admin / supervisor) ─────────────────
export interface StudentEvaluationsResponse {
  success: boolean;
  data: Evaluation[];
}

// ── GET /evaluations/my-evaluation (student) ──────────────────────────────────
export interface MyEvaluationSummary {
  status: string;
  isComplete: boolean;
  finalScore: number | null;
  finalGrade: string | null;
}

export interface MyEvaluationResponse {
  success: boolean;
  data: {
    evaluation: Evaluation | null;
    summary: MyEvaluationSummary;
  };
}

export interface EvaluationScopeParams {
  internshipId?: string;
  batchId?: string;
}
