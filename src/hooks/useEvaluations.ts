import { useQuery } from "@tanstack/react-query";
import {
  getEvaluationsForStudent,
  getMyEvaluation,
} from "../api/services/evaluations";
import type { EvaluationScopeParams } from "../api/types/evaluations";

/** Admin / supervisor — a student's full evaluation history. */
export const useStudentEvaluations = (studentId: string) =>
  useQuery({
    queryKey: ["student-evaluations", studentId],
    queryFn: () => getEvaluationsForStudent(studentId),
    enabled: !!studentId,
  });

/** Student — their own evaluation for the resolved (or given) internship. */
export const useMyEvaluation = (params?: EvaluationScopeParams) =>
  useQuery({
    queryKey: ["my-evaluation", params],
    queryFn: () => getMyEvaluation(params),
  });
