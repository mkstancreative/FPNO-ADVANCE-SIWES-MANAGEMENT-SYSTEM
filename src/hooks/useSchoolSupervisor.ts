import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  getAssignedStudents,
  getStudentDetail,
  getStudentLogbooks,
  getLogbookDetail,
  reviewLogbook,
  getPendingEvaluations,
  requestEvaluations,
  submitSchoolEvaluation,
  type AssignedStudentsParams,
  type LogbookListParams,
  type EvaluationListParams,
  type BatchParams,
  getMyBatches,
  exportSchoolEvaluations,
  getEvaluationReport,
  type EvaluationReportParams,
  type EvaluationReportItem,
  type StudentDetailParams,
} from "../api/services/schoolSupervisors";
import type {
  EvaluationRequestPayload,
  SchoolEvaluationPayload,
} from "../api/types/schoolSupervisor";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Query Keys ───────────────────────────────────────────

export const supervisorQueryKeys = {
  all: ["school-supervisor"] as const,

  students: (params?: AssignedStudentsParams) =>
    [...supervisorQueryKeys.all, "students", params] as const,

  studentDetail: (id: string, params?: StudentDetailParams) =>
    [...supervisorQueryKeys.all, "student", id, params] as const,

  logbooks: (studentId: string, params?: LogbookListParams) =>
    [...supervisorQueryKeys.all, "logbooks", studentId, params] as const,

  logbookDetail: (studentId: string, logbookId: string) =>
    [...supervisorQueryKeys.all, "logbook", studentId, logbookId] as const,

  evaluations: (params?: EvaluationListParams) =>
    [...supervisorQueryKeys.all, "evaluations", params] as const,

  evaluationReport: (params?: EvaluationReportParams) =>
    [...supervisorQueryKeys.all, "evaluation-report", params] as const,

  batches: (params?: BatchParams) =>
    [...supervisorQueryKeys.all, "batches", params] as const,
};

// ─── Hooks ────────────────────────────────────────────────

export const useAssignedStudents = (params?: AssignedStudentsParams) => {
  return useQuery({
    queryKey: supervisorQueryKeys.students(params),
    queryFn: () => getAssignedStudents(params),
  });
};

export const useStudentDetail = (id: string, params?: StudentDetailParams) => {
  return useQuery({
    queryKey: supervisorQueryKeys.studentDetail(id, params),
    queryFn: () => getStudentDetail(id, params),
    enabled: !!id,
  });
};

export const useMyBatches = (params?: BatchParams) => {
  return useQuery({
    queryKey: supervisorQueryKeys.batches(params),
    queryFn: () => getMyBatches(params),
  });
};

export const useStudentLogbooks = (
  studentId: string,
  params?: LogbookListParams,
) => {
  return useQuery({
    queryKey: supervisorQueryKeys.logbooks(studentId, params),
    queryFn: () => getStudentLogbooks(studentId, params),
    enabled: !!studentId,
  });
};

export const useLogbookDetail = (studentId: string, logbookId: string) => {
  return useQuery({
    queryKey: supervisorQueryKeys.logbookDetail(studentId, logbookId),
    queryFn: () => getLogbookDetail(studentId, logbookId),
    enabled: !!studentId && !!logbookId,
  });
};

export const useReviewLogbook = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      logbookId,
      comments,
    }: {
      logbookId: string;
      comments: string;
    }) => reviewLogbook(logbookId, { comments }),
    onSuccess: (data, { logbookId }) => {
      queryClient.invalidateQueries({
        queryKey: supervisorQueryKeys.logbooks(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: supervisorQueryKeys.logbookDetail(studentId, logbookId),
      });
      toast.success(data.message);
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to submit review.")),
  });
};

export const useEvaluations = (params?: EvaluationListParams) => {
  return useQuery({
    queryKey: supervisorQueryKeys.evaluations(params),
    queryFn: () => getPendingEvaluations(params),
  });
};

export const useRequestEvaluations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EvaluationRequestPayload) =>
      requestEvaluations(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [...supervisorQueryKeys.all, "evaluations"],
      });
      if (data.data.failed === 0) {
        toast.success(data.message);
      } else {
        toast.warning(data.message);
      }
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to send evaluation requests.")),
  });
};

export const useSubmitSchoolEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: SchoolEvaluationPayload;
    }) => submitSchoolEvaluation(studentId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [...supervisorQueryKeys.all, "evaluations"],
      });
      toast.success(data.message);
    },
    onError: (err: unknown) => {
      const apiData = (
        err as { response?: { data?: { minimumRequired?: unknown } } }
      )?.response?.data;
      if (apiData && apiData.minimumRequired !== undefined) return;

      toast.error(getErrMsg(err, "Failed to submit school evaluation."));
    },
  });
};

export const useEvaluationReport = (params?: EvaluationReportParams) => {
  return useQuery({
    queryKey: supervisorQueryKeys.evaluationReport(params),
    queryFn: () => getEvaluationReport(params),
  });
};

function departmentName(
  department?: string | { name: string; code?: string },
) {
  if (!department) return "";
  return typeof department === "string" ? department : department.name;
}

function evaluationReportToSheetRow(row: EvaluationReportItem) {
  return {
    "Student Name": row.student.name,
    "Registration Number": row.student.registrationNumber,
    Department: departmentName(row.student.department),
    Program: row.student.program
      ? `${row.student.program.type} ${row.student.program.level}`
      : "",
    Batch: row.batch?.name ?? "",
    Session: row.batch?.session ?? row.internship?.session ?? "",
    "IT Status": row.internship?.itStatus ?? "",
    Position: row.internship?.placement?.position ?? "",
    "Industrial Score": row.scores?.industrial ?? row.industrialScore ?? "",
    "School Score": row.scores?.school ?? row.schoolScore ?? "",
    "Composite Score": row.scores?.composite ?? row.finalScore ?? "",
    "Final Grade": row.finalGrade ?? row.grade ?? "",
    Status: row.status,
    "Completed At": row.completedAt
      ? new Date(row.completedAt).toLocaleDateString("en-GB")
      : "",
  };
}

export const useExportSchoolEvaluations = () => {
  return useMutation({
    mutationFn: (params?: EvaluationReportParams) =>
      exportSchoolEvaluations(params),
    onSuccess: (rows: EvaluationReportItem[]) => {
      if (rows.length === 0) {
        toast.info("No evaluation records match the current filters.");
        return;
      }
      const sheet = XLSX.utils.json_to_sheet(
        rows.map(evaluationReportToSheetRow),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Evaluation Report");
      XLSX.writeFile(workbook, "evaluation_report.xlsx");
      toast.success("Evaluation report exported successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to export evaluation report.")),
  });
};
