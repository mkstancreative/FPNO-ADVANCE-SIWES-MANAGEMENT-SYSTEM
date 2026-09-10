import { useMemo, useState, type FormEvent } from "react";
import { UserRoundPen } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
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
import type {
  Student,
  StudentDetail,
  UpdateStudentRecordPayload,
} from "../../../api/types/student";

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

/** Flatten a student record into the shape the PUT endpoint expects. */
function toPayload(student: StudentDetail): UpdateStudentRecordPayload {
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

  const [initial] = useState<UpdateStudentRecordPayload>(() =>
    toPayload(student),
  );
  const [form, setForm] = useState<UpdateStudentRecordPayload>(initial);

  const setField = <K extends keyof UpdateStudentRecordPayload>(
    field: K,
    value: UpdateStudentRecordPayload[K],
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
    key: keyof UpdateStudentRecordPayload["guarantor"],
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

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    updateStudent({ id: student._id, payload: form }, { onSuccess: onClose });
  };

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
        disabled={isPending || !isDirty}
      >
        {isPending ? (
          <Spinner size={14} color="#fff" text="" />
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
