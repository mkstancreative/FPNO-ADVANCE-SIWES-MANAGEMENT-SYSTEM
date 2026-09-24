import { formatItPeriod } from "../../../../helpers/utilities";
import { displayName } from "../../../../helpers/names";
import React from "react";
import CustomModal from "../../../ui/CustomModal/CustomModal";
import type { AdminCertificateRequest } from "../../../../api/types/certificate";
import "./CertificateView.css";
import {
  User,
  GraduationCap,
  CreditCard,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import StatusBadge from "../../../ui/StatusBadge/StatusBadge";
import Spinner from "../../../ui/Spinner/Spinner";
import {
  useCertDetails,
  useBulkApproveCert,
  useBulkRejectCert,
} from "../../../../hooks/useCertificate";

interface CertificateViewProps {
  id: string;
  onClose: () => void;
}

/** What the bulk endpoints report back for the one certificate sent. */
interface BulkOutcome {
  success: boolean;
  message?: string;
  data?: {
    successful?: string[];
    failed?: { id: string; reason: string }[];
  };
}

/**
 * The reviewer is either reading the request or committing to a decision on
 * it. Both decisions confirm in place rather than in a second modal — the
 * whole point of this screen is having the documents in front of you while you
 * decide, and a rejection reason written without them is a worse reason.
 */
type Mode = "view" | "approve" | "reject";

const CertificateView: React.FC<CertificateViewProps> = ({ id, onClose }) => {
  const { data: certResponse, isLoading } = useCertDetails(id);
  const req: AdminCertificateRequest | undefined = certResponse?.data;

  const [mode, setMode] = React.useState<Mode>("view");
  const [reason, setReason] = React.useState("");
  const [failure, setFailure] = React.useState("");

  const { mutate: approve, isPending: approving } = useBulkApproveCert();
  const { mutate: reject, isPending: rejecting } = useBulkRejectCert();
  const isDeciding = approving || rejecting;

  // There is no single-certificate endpoint — the bulk ones take an array, so
  // one decision is a one-item batch.
  const settle = (res: BulkOutcome) => {
    const failed = res.data?.failed ?? [];
    if (failed.length > 0) {
      // Keep the reviewer here with the reason rather than closing on a
      // refusal they never saw.
      setFailure(failed[0].reason || res.message || "The request was refused.");
      setMode("view");
      return;
    }
    onClose();
  };

  const handleApprove = () =>
    approve(
      { certificateIds: [id] },
      { onSuccess: (r) => settle(r as BulkOutcome) },
    );

  const handleReject = () => {
    if (!reason.trim()) return;
    reject(
      { certificateIds: [id], reason: reason.trim() },
      { onSuccess: (r) => settle(r as BulkOutcome) },
    );
  };

  // Already decided? Then there is nothing to do but read it.
  const isDecided =
    req?.approvalStatus === "approved" || req?.approvalStatus === "rejected";

  const footer = req ? (
    mode === "view" ? (
      <>
        <button className="modal-cancel" type="button" onClick={onClose}>
          Close
        </button>
        {!isDecided && (
          <>
            <button
              type="button"
              className="cv-btn cv-btn--reject"
              onClick={() => {
                setFailure("");
                setMode("reject");
              }}
            >
              <XCircle size={14} />
              Reject
            </button>
            <button
              type="button"
              className="cv-btn cv-btn--approve"
              onClick={() => {
                setFailure("");
                setMode("approve");
              }}
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
          </>
        )}
      </>
    ) : (
      <>
        <button
          className="modal-cancel"
          type="button"
          onClick={() => setMode("view")}
          disabled={isDeciding}
        >
          Back
        </button>
        {mode === "approve" ? (
          <button
            type="button"
            className="cv-btn cv-btn--approve"
            onClick={handleApprove}
            disabled={isDeciding}
          >
            {approving ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Confirm Approval"
            )}
          </button>
        ) : (
          <button
            type="button"
            className="cv-btn cv-btn--reject-solid"
            onClick={handleReject}
            disabled={isDeciding || !reason.trim()}
          >
            {rejecting ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Confirm Rejection"
            )}
          </button>
        )}
      </>
    )
  ) : undefined;

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title={
        isLoading ? "Loading Request Details..." : "Certificate Request Details"
      }
      size="large"
      isLoading={isLoading}
      footer={footer}
    >
      {req && (
        <div className="cert-view-container">
          {failure && (
            <div className="cv-notice cv-notice--error">
              <AlertCircle size={15} />
              <span>{failure}</span>
            </div>
          )}

          {mode === "approve" && (
            <div className="cv-notice cv-notice--approve">
              <CheckCircle2 size={15} />
              <span>
                Approving issues the certificate and notifies the student. Check
                the dates and documents below before confirming.
              </span>
            </div>
          )}

          {mode === "reject" && (
            <div className="cv-decide">
              <label className="cv-decide-label" htmlFor="cv-reason">
                Reason for rejection <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                id="cv-reason"
                rows={3}
                className="cv-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The IT discharge letter does not cover the dates entered."
                autoFocus
              />
              <p className="cv-decide-hint">
                The student is shown this, and resubmits against it — so name
                the specific document or field that is wrong.
              </p>
            </div>
          )}

          <div className="cert-view-grid">
            {/* Section 1: Student Details */}
            <div className="cert-view-section">
              <div className="section-header">
                <div className="section-icon">
                  <User size={18} />
                </div>
                <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                  Student Profile
                </h5>
              </div>

              <div className="section-item">
                <span className="item-label">Full Name</span>
                <span className="item-value">
                  {displayName(
                    req.user,
                    req.student?.registrationNumber || "Student",
                  )}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Registration No.</span>
                <span className="item-value">
                  {req.student.registrationNumber}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Department</span>
                <span className="item-value">
                  {req.student.department.name}
                </span>
              </div>
              <div className="section-item">
                <span className="item-label">Program Type</span>
                <span className="item-value">
                  {req.student.program.type} ({req.student.program.level})
                </span>
              </div>
            </div>

            {/* Section 2: Graduation Info */}
            <div className="cert-view-section">
              <div className="section-header">
                <div className="section-icon">
                  <GraduationCap size={18} />
                </div>
                <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                  Academic Info
                </h5>
              </div>

              <div className="section-item">
                <span className="item-label">Graduation Year</span>
                <span className="item-value">{req.graduationYear}</span>
              </div>
              <div className="section-item">
                <span className="item-label">Graduation Month</span>
                <span className="item-value">{req.graduationMonth}</span>
              </div>
              <div className="section-item">
                <span className="item-label">SIWES Organization</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <MapPin size={12} /> {req.placeOfIT}
                </div>
              </div>
              <div className="section-item">
                <span className="item-label">IT Period</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={12} />{" "}
                  {formatItPeriod(req.itPeriod ?? req.student?.itPeriod)}
                </div>
              </div>
              <div className="section-item">
                <span className="item-label">Request Date</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={12} />{" "}
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Details */}
          <div className="cert-view-section" style={{ marginBottom: "24px" }}>
            <div className="section-header">
              <div className="section-icon">
                <CreditCard size={18} />
              </div>
              <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                Financial Record
              </h5>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <span className="item-label">Payment Status</span>
                <StatusBadge status={req.paymentStatus} />
              </div>
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <span className="item-label">Document Status</span>
                {req.documentStatus ? (
                  <StatusBadge status={req.documentStatus} />
                ) : (
                  <span className="item-value">—</span>
                )}
              </div>
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <span className="item-label">Total Amount</span>
                <span className="item-value" style={{ fontSize: "18px" }}>
                  ₦{req.paymentAmount?.toLocaleString() || "0"}
                </span>
              </div>
              <div
                className="section-item"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <span className="item-label">RRR Reference</span>
                <span
                  className="item-value"
                  style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}
                >
                  {req.rrr || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Document Verification */}
          <div className="cert-view-section">
            <div className="section-header">
              <div className="section-icon">
                <FileText size={18} />
              </div>
              <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                Credential Verification
              </h5>
            </div>

            <div className="doc-grid">
              {req.documents.ndStatementOfResult && (
                <DocLink
                  label="ND Statement of Result"
                  url={req.documents.ndStatementOfResult.url}
                />
              )}
              {req.documents.hndStatementOfResult && (
                <DocLink
                  label="HND Statement of Result"
                  url={req.documents.hndStatementOfResult.url}
                />
              )}
              {req.documents.itDischargeLetter && (
                <DocLink
                  label="IT Discharge Letter"
                  url={req.documents.itDischargeLetter.url}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

function DocLink({ label, url }: { label: string; url: string }) {
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );
  const fullUrl = `${apiBase}/${url.startsWith("/") ? url.slice(1) : url}`;

  return (
    <a href={fullUrl} target="_blank" rel="noreferrer" className="doc-card">
      <div className="doc-card-icon">
        <FileText size={20} />
      </div>
      <span className="doc-card-label">{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 4,
          color: "#3b82f6",
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        View File <ExternalLink size={10} />
      </div>
    </a>
  );
}

export default CertificateView;
