import { api } from "./api";
import type {
  StudentEvaluationsResponse,
  MyEvaluationResponse,
  EvaluationScopeParams,
} from "../types/evaluations";

/** Admin / Coordinator / School supervisor — all of a student's evaluations
 * across every internship. */
export const getEvaluationsForStudent = async (
  studentId: string,
): Promise<StudentEvaluationsResponse> => {
  const response = await api.get(`/evaluations/student/${studentId}`);
  return response.data;
};

/** Student — the "final" evaluation for the resolved internship + a summary. */
export const getMyEvaluation = async (
  params?: EvaluationScopeParams,
): Promise<MyEvaluationResponse> => {
  const response = await api.get("/evaluations/my-evaluation", { params });
  return response.data;
};
