import { useMemo, useState, type FormEvent } from "react";
import { UserRoundPen } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import Toggler from "../../ui/Toggler/Toggler";
import {
  useStudentById,
  useUpdateStudentRecord,
} from "../../../hooks/useStudents";
import { useDepartments } from "../../../hooks/useBatches";
import {
  DEPARTMENTS_BY_SCHOOL,
  OTHER_DEPARTMENTS_GROUP,
  findDepartment,
} from "../../../config/departments";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../../../api/services/api";
import type {
  Student,
  StudentDetail,
  UpdateStudentRecordPayload,
  UpdateStudentRecordResponse,
} from "../../../api/types/student";

/**
 * The PUT payload is partial (send only what changed), but the form needs a
 * value for every control. This is the complete shape the inputs bind to; the
 * patch is derived from it at submit time. `reissueInvoice` is left out on
 * purpose — it is a control flag, not a record field, so it never takes part
 * in the diff and is tracked as its own piece of state.
 */
type StudentRecordForm = Required<
  Omit<UpdateStudentRecordPayload, "reissueInvoice">
>;

interface EditStudentProps {
  isOpen: boolean;
  onClose: () => void;
  /** Row from the students table; the full record is fetched by _id. */
  student: Student;
}

const PROGRAM_TYPES = ["ND", "HND"];
const LEVELS_BY_TYPE: Record<string, string[]> = {
  ND: ["ND1", "ND2"],
  HND: ["HND1", "HND2"],
};

/** Flatten a student record into the form's complete shape. */
function toForm(student: StudentDetail): StudentRecordForm {
  const { guarantor } = student;
  return {
    firstName: student.user?.firstName ?? "",
    lastName: student.user?.lastName ?? "",
    email: student.user?.email ?? "",
    phone: student.user?.phone ?? "",
    registrationNumber: student.registrationNumber ?? "",
    department: {
      name: student.department?.name ?? "",
      code: student.department?.code ?? "",
    },
    program: {
      type: student.program?.type ?? "",
      level: student.program?.level ?? "",
    },
    guarantor: {
      name: guarantor?.name ?? "",
      relationship: guarantor?.relationship ?? "",
      phone: guarantor?.phone ?? "",
      address: guarantor?.address ?? "",
    },
  };
}

export default function EditStudent({
  isOpen,
  onClose,
  student,
}: EditStudentProps) {
  // The list row carries no guarantor — pull the full record before editing so
  // the PUT never sends a blank guarantor over a populated one.
  const { data: detail, isLoading } = useStudentById(student._id);

  if (isLoading || !detail) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Student"
        subtitle={student.registrationNumber}
        icon={<UserRoundPen size={16} />}
        size="wide"
      >
        <div
          style={{
            padding: "40px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Spinner
            size={22}
            color="var(--color-accent)"
            text="Loading student…"
          />
        </div>
      </CustomModal>
    );
  }

  return <EditStudentForm isOpen={isOpen} onClose={onClose} student={detail} />;
}

function EditStudentForm({
  isOpen,
  onClose,
  student,
}: {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetail;
}) {
  const { data: departmentsData } = useDepartments();
  const { mutate: updateStudent, isPending } = useUpdateStudentRecord();

  const [initial] = useState<StudentRecordForm>(() => toForm(student));
  const [form, setForm] = useState<StudentRecordForm>(initial);
  const [conflict, setConflict] = useState("");
  // Opt-in and off by default: reissuing bills the student again, so it only
  // ever happens because the admin deliberately asked for it.
  const [reissueInvoice, setReissueInvoice] = useState(false);
  const [result, setResult] = useState<UpdateStudentRecordResponse | null>(
    null,
  );

  const setField = <K extends keyof StudentRecordForm>(
    field: K,
    value: StudentRecordForm[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const setDepartmentName = (name: string) =>
    setForm((prev) => ({
      ...prev,
      department: {
        name,
        // The catalogue owns the code; only keep a typed one for off-list names.
        code: findDepartment(name)?.code ?? (name ? prev.department.code : ""),
      },
    }));

  const setDepartmentCode = (code: string) =>
    setForm((prev) => ({ ...prev, department: { ...prev.department, code } }));

  const setProgram = (key: "type" | "level", value: string) =>
    setForm((prev) => {
      const program = { ...prev.program, [key]: value };
      // Switching program type invalidates the old level.
      if (key === "type" && !LEVELS_BY_TYPE[value]?.includes(program.level)) {
        program.level = "";
      }
      return { ...prev, program };
    });

  const setGuarantor = (
    key: keyof StudentRecordForm["guarantor"],
    value: string,
  ) =>
    setForm((prev) => ({
      ...prev,
      guarantor: { ...prev.guarantor, [key]: value },
    }));

  /**
   * The institution catalogue grouped by school, plus an "Other" group holding
   * any department the API reports (or this record already carries) that the
   * catalogue doesn't know about — so no existing value becomes unselectable.
   */
  const departmentGroups = useMemo(() => {
    const catalogued = new Set(
      DEPARTMENTS_BY_SCHOOL.flatMap(({ departments }) =>
        departments.map((d) => d.name),
      ),
    );
    const extras = [
      ...(departmentsData?.data ?? []),
      form.department.name,
    ].filter((name) => name && !catalogued.has(name));

    const groups = DEPARTMENTS_BY_SCHOOL.map(({ school, departments }) => ({
      label: school.name,
      names: departments.map((d) => d.name),
    }));

    return extras.length > 0
      ? [
          ...groups,
          {
            label: OTHER_DEPARTMENTS_GROUP,
            names: Array.from(new Set(extras)),
          },
        ]
      : groups;
  }, [departmentsData, form.department.name]);

  // Keep whatever the record already holds selectable, even if it's off-list.
  const programTypeOptions = PROGRAM_TYPES.includes(form.program.type)
    ? PROGRAM_TYPES
    : [form.program.type, ...PROGRAM_TYPES].filter(Boolean);

  const knownLevels = LEVELS_BY_TYPE[form.program.type] ?? [];
  const levelOptions =
    form.program.level && !knownLevels.includes(form.program.level)
      ? [form.program.level, ...knownLevels]
      : knownLevels;

  /**
   * The endpoint is a partial update, so send only what actually moved —
   * that keeps the backend's `changes` diff honest and avoids tripping the
   * uniqueness check on an email or registration number the admin never
   * touched.
   */
  const patch = useMemo<UpdateStudentRecordPayload>(() => {
    const next: UpdateStudentRecordPayload = {};
    const scalars = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "registrationNumber",
    ] as const;
    scalars.forEach((key) => {
      if (form[key] !== initial[key]) next[key] = form[key];
    });
    const objects = ["department", "program", "guarantor"] as const;
    objects.forEach((key) => {
      if (JSON.stringify(form[key]) !== JSON.stringify(initial[key])) {
        // Nested groups go whole — the backend merges them field by field.
        next[key] = form[key] as never;
      }
    });
    return next;
  }, [form, initial]);

  const isDirty = Object.keys(patch).length > 0;
  // Reissuing is a real action on its own — the admin may want a fresh
  // invoice without correcting a single field — so it unlocks submit too.
  const canSubmit = isDirty || reissueInvoice;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setConflict("");
    updateStudent(
      {
        id: student._id,
        // Send the flag only when it is on; an unchecked toggle should look
        // exactly like a request that never knew about it.
        payload: reissueInvoice ? { ...patch, reissueInvoice: true } : patch,
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => {
          // 409 means the email or registration number belongs to someone
          // else. Keep the admin in the form so they can correct it.
          if (getApiErrorStatus(error) === 409) {
            setConflict(
              getApiErrorMessage(
                error,
                "That email or registration number already belongs to another account.",
              ),
            );
          }
        },
      },
    );
  };

  if (result) {
    return (
      <UpdateResult
        isOpen={isOpen}
        onClose={onClose}
        result={result}
        reissued={reissueInvoice}
        name={[form.firstName, form.lastName].filter(Boolean).join(" ")}
      />
    );
  }

  const footer = (
    <>
      <button
        className="modal-cancel"
        type="button"
        onClick={onClose}
        disabled={isPending}
      >
        Cancel
      </button>
      <button
        className="modal-submit"
        form="edit-student-form"
        type="submit"
        disabled={isPending || !canSubmit}
      >
        {isPending ? (
          <Spinner size={14} color="#fff" text="" />
        ) : !isDirty && reissueInvoice ? (
          "Reissue Invoice"
        ) : (
          "Save Changes"
        )}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      subtitle={
        [form.firstName, form.lastName].filter(Boolean).join(" ") ||
        student.registrationNumber ||
        "Update student records"
      }
      icon={<UserRoundPen size={16} />}
      size="wide"
      footer={footer}
    >
      <form
        id="edit-student-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {conflict && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.5,
              color: "#b91c1c",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderLeft: "4px solid #ef4444",
            }}
          >
            {conflict}
          </div>
        )}
        {/* ── Personal ── */}
        <FieldSet label="Personal Details">
          <div className="form-grid">
            <div className="form-group col-2">
              <label className="modal-label">
                First Name <Required />
              </label>
              <input
                required
                type="text"
                className="modal-input"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="e.g. Chukwuemeka"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">
                Last Name <Required />
              </label>
              <input
                required
                type="text"
                className="modal-input"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="e.g. Okonkwo-Eze"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">
                Email <Required />
              </label>
              <input
                required
                type="email"
                className="modal-input"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="student@example.com"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">
                Phone <Required />
              </label>
              <input
                required
                type="tel"
                className="modal-input"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="e.g. 08123456789"
              />
            </div>
          </div>
        </FieldSet>

        {/* ── Academic ── */}
        <FieldSet label="Academic Details">
          <div className="form-grid">
            <div className="form-group col-2">
              <label className="modal-label">
                Registration Number <Required />
              </label>
              <input
                required
                type="text"
                className="modal-input"
                value={form.registrationNumber}
                onChange={(e) => setField("registrationNumber", e.target.value)}
                placeholder="e.g. FPO/CST/ND2/2024/007"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Department</label>
              <select
                className="modal-input"
                value={form.department.name}
                onChange={(e) => setDepartmentName(e.target.value)}
              >
                <option value="">Select department</option>
                {departmentGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.names.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Department Code</label>
              <input
                type="text"
                className="modal-input"
                value={form.department.code}
                onChange={(e) =>
                  setDepartmentCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. CST"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Program Type</label>
              <select
                className="modal-input"
                value={form.program.type}
                onChange={(e) => setProgram("type", e.target.value)}
              >
                <option value="">Select program</option>
                {programTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Level</label>
              <select
                className="modal-input"
                value={form.program.level}
                onChange={(e) => setProgram("level", e.target.value)}
                disabled={!form.program.type}
              >
                <option value="">
                  {form.program.type ? "Select level" : "Select program first"}
                </option>
                {levelOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FieldSet>

        {/* ── Guarantor ── */}
        <FieldSet label="Guarantor">
          <div className="form-grid">
            <div className="form-group col-2">
              <label className="modal-label">Full Name</label>
              <input
                type="text"
                className="modal-input"
                value={form.guarantor.name}
                onChange={(e) => setGuarantor("name", e.target.value)}
                placeholder="e.g. Ngozi Okonkwo"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Relationship</label>
              <input
                type="text"
                className="modal-input"
                value={form.guarantor.relationship}
                onChange={(e) => setGuarantor("relationship", e.target.value)}
                placeholder="e.g. Mother"
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Phone</label>
              <input
                type="tel"
                className="modal-input"
                value={form.guarantor.phone}
                onChange={(e) => setGuarantor("phone", e.target.value)}
                placeholder="e.g. 08133334444"
              />
            </div>
            <div className="form-group col-12">
              <label className="modal-label">Address</label>
              <textarea
                rows={2}
                className="modal-input"
                value={form.guarantor.address}
                onChange={(e) => setGuarantor("address", e.target.value)}
                placeholder="e.g. 42 Wetheral Road, Owerri, Imo State"
              />
            </div>
          </div>
        </FieldSet>

        {/* ── Billing ── */}
        <FieldSet label="Billing">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ paddingTop: 2 }}>
              <Toggler
                checked={reissueInvoice}
                onChange={(e) => setReissueInvoice(e.target.checked)}
                disabled={isPending}
              />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                Reissue this student&rsquo;s invoice
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "var(--color-text-secondary)",
                }}
              >
                Off by default. Turn it on to have a fresh invoice generated
                when you save — useful after a correction that changes what the
                student owes. You can also reissue on its own, without editing
                any field.
              </div>
            </div>
          </div>
        </FieldSet>
      </form>
    </CustomModal>
  );
}

function Required() {
  return <span style={{ color: "#ef4444" }}>*</span>;
}

function FieldSet({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--color-text-secondary)",
          paddingBottom: 6,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * What the backend actually changed. Worth showing rather than closing
 * silently: a department edit re-assigns the school supervisor as a side
 * effect, and the admin should see that happen.
 */
function UpdateResult({
  isOpen,
  onClose,
  result,
  reissued,
  name,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: UpdateStudentRecordResponse;
  /** Whether this save asked for a fresh invoice. */
  reissued: boolean;
  name: string;
}) {
  const changes = result.data?.changes ?? [];
  const reassignment = result.data?.supervisorReassignment;

  const render = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Updated"
      subtitle={name || "Student record saved"}
      icon={<UserRoundPen size={16} />}
      size="medium"
      footer={
        <button className="modal-submit" type="button" onClick={onClose}>
          Done
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
          }}
        >
          {result.message ||
            (changes.length > 0
              ? `${changes.length} field${changes.length === 1 ? "" : "s"} updated.`
              : reissued
                ? "No record fields needed changing."
                : "No fields needed changing.")}
        </p>

        {changes.length > 0 && (
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {changes.map((change, i) => (
              <div
                key={change.field}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(110px, 1fr) 2fr",
                  gap: 10,
                  padding: "10px 14px",
                  fontSize: 12.5,
                  borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {change.field}
                </span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {render(change.from)}
                  </span>{" "}
                  → <strong>{render(change.to)}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {reissued && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--color-text-primary)",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderLeft: "4px solid #10b981",
            }}
          >
            <strong style={{ display: "block", marginBottom: 2 }}>
              Invoice reissued
            </strong>
            A fresh invoice was requested for this student.
          </div>
        )}

        {reassignment && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--color-text-primary)",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <strong style={{ display: "block", marginBottom: 2 }}>
              School supervisor re-assigned
            </strong>
            {reassignment.message ||
              `${render(reassignment.from)} → ${render(reassignment.to)}`}
          </div>
        )}
      </div>
    </CustomModal>
  );
}
