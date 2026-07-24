import React, { useState } from "react";
import { CheckCircle2, Building2, BookOpen, Info } from "lucide-react";
import {
  useRequestCertificate,
  useRequestInternshipCertificate,
  useResendCertificateRequest,
} from "../../../hooks/useCertificate";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import type { RRRData } from "../../../api/types/certificate";

interface CertificateRequestModalProps {
  isOpen: boolean;
  onClose: (data?: RRRData) => void;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selfRegistered) {
      // Non-self-registered: dedicated endpoint with internshipId + batchId
      requestInternship(
        { internshipId, batchId },
        {
          onSuccess: (res) => {
            if (res.success) {
              onClose(res.data);
            }
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
            if (res.success) {
              onClose(res.data);
            }
          },
        },
      );
    } else {
      request(data, {
        onSuccess: (res) => {
          if (res.success) {
            onClose(res.data);
          }
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
            ? "Provide your graduation and placement details"
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
        className="form-grid"
      >
        {!selfRegistered ? (
          /* ── Non-self-registered: display batch & internship info ── */
          <div className="form-group col-4">
            <div
              style={{
                background: "var(--color-accent-soft)",
                border: "1px solid var(--color-accent)",
                borderRadius: "10px",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  fontSize: 13.5,
                }}
              >
                <Info size={15} />
                Your internship record will be used to generate your certificate
              </div>

              {batchName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13.5,
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-bg-secondary)",
                      padding: "6px",
                      borderRadius: "7px",
                      color: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: 11.5,
                        marginBottom: 2,
                      }}
                    >
                      Batch
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {batchName}
                      {batchSession && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11.5,
                            fontWeight: 400,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          · {batchSession}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {placementCompany && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13.5,
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-bg-secondary)",
                      padding: "6px",
                      borderRadius: "7px",
                      color: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={14} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: 11.5,
                        marginBottom: 2,
                      }}
                    >
                      Place of IT
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {placementCompany}
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: 10,
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                This certificate request will be linked to your internship and batch.
              </div>
            </div>
          </div>
        ) : (
          /* ── Self-registered: full graduation + document form ── */
          <>
            <div className="form-group col-2">
              <label className="modal-label">Graduation Year</label>
              <select
                name="graduationYear"
                className="modal-input"
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

            <div className="form-group col-2">
              <label className="modal-label">Graduation Month</label>
              <select
                name="graduationMonth"
                className="modal-input"
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

            <div className="form-group col-2">
              <label className="modal-label">Exact Graduation Date</label>
              <input
                type="date"
                name="graduationDate"
                className="modal-input"
                value={formData.graduationDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Place of IT</label>
              <input
                type="text"
                name="placeOfIT"
                className="modal-input"
                placeholder="e.g. Netpro International"
                value={formData.placeOfIT}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group col-4">
              <label className="modal-label">
                Did you do your ND in Holy Rosary Hospital College of Nursing
                Sciences?
              </label>
              <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <input
                    type="radio"
                    name="schooledInPoly"
                    checked={schooledInPoly === true}
                    onChange={() => setSchooledInPoly(true)}
                  />
                  Yes, I attended Holy Rosary Hospital College of Nursing Sciences
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <input
                    type="radio"
                    name="schooledInPoly"
                    checked={schooledInPoly === false}
                    onChange={() => setSchooledInPoly(false)}
                  />
                  No, I attended another institution
                </label>
              </div>
            </div>

            <div className="section-title-divider">Required Documents</div>

            <div className="form-group col-2">
              <label className="modal-label">ND Statement of Result</label>
              <input
                type="file"
                className="modal-input"
                name="ndStatementOfResult"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">IT Discharge Letter</label>
              <input
                type="file"
                className="modal-input"
                name="itDischargeLetter"
                onChange={handleFileChange}
                required
              />
            </div>

            {!schooledInPoly && (
              <div className="form-group col-2">
                <label className="modal-label">HND Statement of Result</label>
                <input
                  type="file"
                  className="modal-input"
                  name="hndStatementOfResult"
                  onChange={handleFileChange}
                  required={!schooledInPoly}
                />
              </div>
            )}
          </>
        )}
      </form>
    </CustomModal>
  );
};
