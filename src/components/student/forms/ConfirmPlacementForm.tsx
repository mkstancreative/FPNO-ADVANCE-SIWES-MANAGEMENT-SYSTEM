import { useState, useRef, useEffect, type FormEvent } from "react";
import { UploadCloud, CheckCircle, X } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useConfirmPlacement } from "../../../hooks/useITStudents";
import type { ConfirmPlacementPayload } from "../../../api/types/itstudent";
import {
  fetchStatesByCountry,
  fetchCitiesByState,
} from "../../../api/services/location";
import "./ConfirmPlacementForm.css";

interface ConfirmPlacementFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const buildInitial = (): Omit<ConfirmPlacementPayload, "acceptanceLetter"> => ({
  companyName: "",
  companyAddress: "",
  companyCity: "",
  companyState: "",
  companyPhone: "",
  companyEmail: "",
  industry: "",
  position: "",
  department: "",
  startDate: "",
  supervisorName: "",
  supervisorPhone: "",
  supervisorEmail: "",
  supervisorPosition: "",
  companyType: "private",
});

export default function ConfirmPlacementForm({
  isOpen,
  onClose,
}: ConfirmPlacementFormProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Placement"
      subtitle="Provide details about your industrial attachment placement"
      size="wide"
    >
      <ConfirmPlacementInner onClose={onClose} />
    </CustomModal>
  );
}

function ConfirmPlacementInner({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(buildInitial);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: confirmPlacement, isPending } = useConfirmPlacement();

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Countries Now API ───────────────────────────────────────────
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch Nigeria states once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingStates(true);
      try {
        const data = await fetchStatesByCountry("Nigeria");
        if (!cancelled) setStates(data);
      } catch {
        if (!cancelled) setStates([]);
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.companyState) return;
    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const data = await fetchCitiesByState(form.companyState!, "Nigeria");
        if (!cancelled) setCities(data);
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.companyState]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const payload: ConfirmPlacementPayload = {
      ...form,
      acceptanceLetter: file,
    };
    confirmPlacement(payload, { onSuccess: onClose });
  };

  return (
    <form className="cp-form" onSubmit={handleSubmit}>
      {/* ── File Upload ── */}
      <div className="cp-section">
        <div className="cp-section-label">Acceptance Letter</div>
        <div
          className={`cp-file-drop ${file ? "has-file" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            hidden
          />
          {file ? (
            <div className="cp-file-preview">
              <CheckCircle size={24} className="cp-file-icon success" />
              <div className="cp-file-info">
                <span className="cp-file-name">{file.name}</span>
                <span className="cp-file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className="cp-file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="cp-file-empty">
              <UploadCloud size={28} className="cp-file-icon" />
              <p>Click to upload your Acceptance Letter</p>
              <span className="cp-file-hint">PDF Only, up to 5MB</span>
            </div>
          )}
        </div>
      </div>

      <div className="cp-row-2">
        {/* ── Company Info ── */}
        <div className="cp-section">
          <div className="cp-section-label">Company Information</div>
          <div className="form-group">
            <label className="modal-label">
              Company Name <span className="req">*</span>
            </label>
            <input
              required
              type="text"
              className="modal-input"
              placeholder="Enter Company Name"
              value={form.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="modal-label">
              Address <span className="req">*</span>
            </label>
            <input
              required
              type="text"
              className="modal-input"
              placeholder="Enter Company Address"
              value={form.companyAddress}
              onChange={(e) => setField("companyAddress", e.target.value)}
            />
          </div>
          <div className="cp-row-2-inner">
            <div className="form-group">
              <label className="modal-label">
                State <span className="req">*</span>{" "}
                {loadingStates && (
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    (loading…)
                  </span>
                )}
              </label>
              <select
                className="modal-input"
                value={form.companyState}
                onChange={(e) => {
                  // Reset city selections synchronously in the event handler
                  setCities([]);
                  setForm((prev) => ({
                    ...prev,
                    companyState: e.target.value,
                    companyCity: "",
                  }));
                }}
                disabled={loadingStates}
              >
                <option value="" hidden>
                  {loadingStates ? "Loading states…" : "Select a State"}
                </option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="modal-label">
                City <span className="req">*</span>{" "}
                {loadingCities && (
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    (loading…)
                  </span>
                )}
              </label>
              <select
                required
                className="modal-input"
                value={form.companyCity}
                onChange={(e) => setField("companyCity", e.target.value)}
                disabled={!form.companyState || loadingCities}
              >
                <option value="" hidden>
                  {!form.companyState
                    ? "Select a State first"
                    : loadingCities
                      ? "Loading cities…"
                      : "Select a City"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="cp-row-2-inner">
            <div className="form-group">
              <label className="modal-label">
                Phone <span className="req">*</span>
              </label>
              <input
                required
                type="tel"
                className="modal-input"
                placeholder="Enter Company Phone"
                value={form.companyPhone}
                onChange={(e) => setField("companyPhone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Email <span className="req">*</span>
              </label>
              <input
                required
                type="email"
                className="modal-input"
                placeholder="Enter Company Email"
                value={form.companyEmail}
                onChange={(e) => setField("companyEmail", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="modal-label">Industry</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Information Technology"
              value={form.industry}
              onChange={(e) => setField("industry", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="modal-label">Company Type</label>
            <select
              className="modal-input"
              value={form.companyType}
              onChange={(e) => setField("companyType", e.target.value)}
            >
              <option value="" hidden>
                Select Company Type
              </option>
              <option value="private">Private</option>
              <option value="ngo">NGO</option>
              <option value="government">Government</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          {/* ── Role & Dept ── */}
          <div className="cp-section ">
            <div className="cp-section-label">
              Fill in your Role in the Company
            </div>
            <div className="form-group">
              <label className="modal-label">
                Position / Title <span className="req">*</span>
              </label>
              <input
                required
                type="text"
                className="modal-input"
                placeholder="e.g. Software Development Intern"
                value={form.position}
                onChange={(e) => setField("position", e.target.value)}
              />
            </div>
            <div className="cp-row-2-inner">
              <div className="form-group">
                <label className="modal-label">Department</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Enter Department"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">
                  Start Date <span className="req">*</span>
                </label>
                <input
                  required
                  type="date"
                  className="modal-input"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Supervisor ── */}
          <div className="cp-section" style={{ marginTop: 24 }}>
            <div className="cp-section-label">Industry Supervisor</div>
            <div className="form-group">
              <label className="modal-label">
                Supervisor Name <span className="req">*</span>
              </label>
              <input
                required
                type="text"
                className="modal-input"
                placeholder="Enter Supervisor Name"
                value={form.supervisorName}
                onChange={(e) => setField("supervisorName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Position <span className="req">*</span>
              </label>
              <input
                required
                type="text"
                className="modal-input"
                placeholder="e.g. IT Manager"
                value={form.supervisorPosition}
                onChange={(e) => setField("supervisorPosition", e.target.value)}
              />
            </div>
            <div className="cp-row-2-inner">
              <div className="form-group">
                <label className="modal-label">
                  Phone <span className="req">*</span>
                </label>
                <input
                  required
                  type="tel"
                  className="modal-input"
                  placeholder="Enter Supervisor Phone"
                  value={form.supervisorPhone}
                  onChange={(e) => setField("supervisorPhone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">
                  Email <span className="req">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="modal-input"
                  placeholder="Enter Supervisor Email"
                  value={form.supervisorEmail}
                  onChange={(e) => setField("supervisorEmail", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="modal-submit"
          disabled={isPending || !file}
        >
          {isPending ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
