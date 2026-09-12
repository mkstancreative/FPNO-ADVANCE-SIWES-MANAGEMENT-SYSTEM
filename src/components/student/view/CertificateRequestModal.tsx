import React, { useState, useRef } from "react";
import {
  CheckCircle2,
  Building2,
  BookOpen,
  Info,
  ShieldCheck,
  UploadCloud,
  X,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import {
  useRequestCertificate,
  useRequestInternshipCertificate,
  useResendCertificateRequest,
} from "../../../hooks/useCertificate";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import "./CertificateRequestModal.css";

/**
 * Document submission only. Payment now happens *before* this modal opens —
 * external students via `initiate-payment`, platform students via their
 * internship fee — so nothing here returns an RRR or opens a payment screen.
 */
interface CertificateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: string;
  // When selfRegistered is false, the backend only needs internshipId + batchId
  selfRegistered?: boolean;
  internshipId?: string;
  batchId?: string;
  // Contextual display info for non-selfRegistered mode
  batchName?: string;
  batchSession?: string;
  placementCompany?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileUploadFieldProps {
  label: string;
  name: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  hint?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  name,
  file,
  onFileSelect,
  required = false,
  accept = ".pdf,.png,.jpg,.jpeg,application/pdf,image/*",
  hint = "PDF, PNG or JPG (Max 5MB)",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="crm-doc-item">
      <label className="crm-label" htmlFor={`file-${name}`}>
        {label} {required && <span className="req">*</span>}
      </label>
      <div
        className={`crm-upload-box ${file ? "has-file" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id={`file-${name}`}
          type="file"
          name={name}
          className="crm-hidden-file-input"
          accept={accept}
          onChange={handleInputChange}
          required={required && !file}
        />

        {!file ? (
          <div className="crm-upload-empty">
            <div className="crm-upload-icon-wrap">
              <UploadCloud size={18} />
            </div>
            <div className="crm-upload-text">
              <span className="crm-upload-action">Choose file to upload</span>
              <span className="crm-upload-hint">{hint}</span>
            </div>
          </div>
        ) : (
          <div className="crm-upload-preview">
            <div className="crm-upload-preview-left">
              <CheckCircle2 size={18} className="crm-file-success-icon" />
              <div className="crm-upload-preview-info">
                <span className="crm-file-name" title={file.name}>
                  {file.name}
                </span>
                <span className="crm-file-size">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="crm-file-remove-btn"
              title="Remove file"
              aria-label="Remove file"
              onClick={handleRemove}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CertificateRequestModal: React.FC<
  CertificateRequestModalProps
> = ({
  isOpen,
  onClose,
  requestId,
  selfRegistered = true,
  internshipId,
  batchId,
  batchName,
  batchSession,
  placementCompany,
}) => {
  const { mutate: request, isPending: requesting } = useRequestCertificate();
  const { mutate: requestInternship, isPending: requestingInternship } =
    useRequestInternshipCertificate();
  const { mutate: resend, isPending: resending } =
    useResendCertificateRequest();
  const isPending = requesting || resending || requestingInternship;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const [formData, setFormData] = useState({
    graduationYear: currentYear.toString(),
    graduationMonth: "January",
    graduationDate: new Date().toISOString().split("T")[0],
    placeOfIT: "",
  });

  const [schooledInPoly, setSchooledInPoly] = useState(true);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    ndStatementOfResult: null,
    itDischargeLetter: null,
    hndStatementOfResult: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selfRegistered) {
      // Platform student: the internship fee already covered this, so the
      // dedicated endpoint takes only internshipId + batchId and returns
      // nothing to pay.
      requestInternship(
        { internshipId, batchId },
        {
          onSuccess: (res) => {
            if (res.success) onClose();
          },
        },
      );
      return;
    }

    // Self-registered: full FormData
    const data = new FormData();
    data.append("graduationYear", formData.graduationYear);
    data.append("graduationMonth", formData.graduationMonth);
    data.append("graduationDate", formData.graduationDate);
    data.append("placeOfIT", formData.placeOfIT);

    if (files.ndStatementOfResult) {
      data.append("ndStatementOfResult", files.ndStatementOfResult);
    }
    if (files.itDischargeLetter) {
      data.append("itDischargeLetter", files.itDischargeLetter);
    }
    if (!schooledInPoly && files.hndStatementOfResult) {
      data.append("hndStatementOfResult", files.hndStatementOfResult);
    }

    if (requestId) {
      resend(
        { id: requestId, payload: data },
        {
          onSuccess: (res) => {
            if (res.success) onClose();
          },
        },
      );
    } else {
      request(data, {
        onSuccess: (res) => {
          if (res.success) onClose();
        },
      });
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        requestId ? "Re-apply for IT Certificate" : "Request IT Certificate"
      }
      subtitle={
        requestId
          ? "Update your details and resubmit for review"
          : selfRegistered
            ? "Your fee is paid — upload your documents to finish"
            : "Confirm your internship details to request your certificate"
      }
      icon={<CheckCircle2 size={18} />}
      size="medium"
      footer={
        <>
          <button
            className="modal-cancel"
            type="button"
            onClick={() => onClose()}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            type="submit"
            form="cert-request-form"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" />
            ) : requestId ? (
              "Resubmit Request"
            ) : selfRegistered ? (
              "Submit Documents"
            ) : (
              "Submit Request"
            )}
          </button>
        </>
      }
    >
      <form
        id="cert-request-form"
        onSubmit={handleSubmit}
        className="crm-form"
      >
        {!selfRegistered ? (
          /* ── Non-self-registered: display batch & internship info ── */
          <div className="crm-platform-card">
            <div className="crm-platform-header">
              <Info size={16} />
              <span>Your internship record will be used to generate your certificate</span>
            </div>

            <div className="crm-platform-grid">
              {batchName && (
                <div className="crm-platform-item">
                  <div className="crm-platform-item-icon">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <div className="crm-platform-item-label">Batch</div>
                    <div className="crm-platform-item-value">
                      {batchName}
                      {batchSession && (
                        <span style={{ color: "var(--color-text-muted)", fontWeight: 400, fontSize: 12 }}>
                          ({batchSession})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {placementCompany && (
                <div className="crm-platform-item">
                  <div className="crm-platform-item-icon">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="crm-platform-item-label">Place of IT</div>
                    <div className="crm-platform-item-value">
                      {placementCompany}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="crm-platform-footer">
              <ShieldCheck size={14} color="var(--color-accent, #2dd4bf)" />
              <span>
                Your internship fee covers this certificate — there is nothing further to pay.
              </span>
            </div>
          </div>
        ) : (
          /* ── Self-registered: full graduation + document form ── */
          <>
            {!requestId && (
              <div className="crm-banner">
                <ShieldCheck size={18} className="crm-banner-icon" />
                <span>
                  Certificate fee received. Complete the details below and upload your documents to send your request for review.
                </span>
              </div>
            )}

            <div className="crm-section-divider">
              <GraduationCap size={15} />
              <span>Graduation & Placement Details</span>
            </div>

            <div className="crm-grid-2">
              <div className="crm-form-group">
                <label className="crm-label" htmlFor="graduationYear">
                  Graduation Year <span className="req">*</span>
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  className="crm-input"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crm-form-group">
                <label className="crm-label" htmlFor="graduationMonth">
                  Graduation Month <span className="req">*</span>
                </label>
                <select
                  id="graduationMonth"
                  name="graduationMonth"
                  className="crm-input"
                  value={formData.graduationMonth}
                  onChange={handleInputChange}
                  required
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              <div className="crm-form-group">
                <label className="crm-label" htmlFor="graduationDate">
                  Exact Graduation Date <span className="req">*</span>
                </label>
                <input
                  id="graduationDate"
                  type="date"
                  name="graduationDate"
                  className="crm-input"
                  value={formData.graduationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="crm-form-group">
                <label className="crm-label" htmlFor="placeOfIT">
                  Place of IT <span className="req">*</span>
                </label>
                <input
                  id="placeOfIT"
                  type="text"
                  name="placeOfIT"
                  className="crm-input"
                  placeholder="e.g. Netpro International"
                  value={formData.placeOfIT}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="crm-form-group col-full">
              <label className="crm-label">
                Did you do your ND at Federal Polytechnic Nekede, Owerri? <span className="req">*</span>
              </label>
              <div className="crm-radio-grid">
                <div
                  className={`crm-radio-card ${schooledInPoly ? "active" : ""}`}
                  onClick={() => setSchooledInPoly(true)}
                >
                  <input
                    type="radio"
                    id="poly-yes"
                    name="schooledInPoly"
                    className="crm-radio-input"
                    checked={schooledInPoly === true}
                    onChange={() => setSchooledInPoly(true)}
                  />
                  <div className="crm-radio-content">
                    <span className="crm-radio-title">
                      Yes, Federal Polytechnic Nekede
                    </span>
                    <span className="crm-radio-sub">
                      Only ND statement & IT discharge letter required
                    </span>
                  </div>
                </div>

                <div
                  className={`crm-radio-card ${!schooledInPoly ? "active" : ""}`}
                  onClick={() => setSchooledInPoly(false)}
                >
                  <input
                    type="radio"
                    id="poly-no"
                    name="schooledInPoly"
                    className="crm-radio-input"
                    checked={schooledInPoly === false}
                    onChange={() => setSchooledInPoly(false)}
                  />
                  <div className="crm-radio-content">
                    <span className="crm-radio-title">
                      No, Another Institution
                    </span>
                    <span className="crm-radio-sub">
                      HND Statement of Result also required
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="crm-section-divider">
              <FileCheck size={15} />
              <span>Required Documents</span>
            </div>

            <div className={`crm-docs-grid ${!schooledInPoly ? "has-three" : ""}`}>
              <FileUploadField
                label="ND Statement of Result"
                name="ndStatementOfResult"
                file={files.ndStatementOfResult}
                onFileSelect={(file) => handleFileChange("ndStatementOfResult", file)}
                required
              />

              <FileUploadField
                label="IT Discharge Letter"
                name="itDischargeLetter"
                file={files.itDischargeLetter}
                onFileSelect={(file) => handleFileChange("itDischargeLetter", file)}
                required
              />

              {!schooledInPoly && (
                <FileUploadField
                  label="HND Statement of Result"
                  name="hndStatementOfResult"
                  file={files.hndStatementOfResult}
                  onFileSelect={(file) => handleFileChange("hndStatementOfResult", file)}
                  required={!schooledInPoly}
                />
              )}
            </div>
          </>
        )}
      </form>
    </CustomModal>
  );
};
