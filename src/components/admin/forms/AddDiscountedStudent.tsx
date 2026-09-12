import { useState, type FormEvent } from "react";
import { Percent } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import RepriceReportSummary from "../certificates/RepriceReportSummary";
import { useAddCertificateDiscount } from "../../../hooks/useCertificate";
import type { RepriceReport } from "../../../api/types/certificate";

interface AddDiscountedStudentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Add one student to the pre-paid discount list.
 *
 * The endpoint re-prices as a side effect: if the student already raised a
 * certificate invoice at the full fee, it is reissued at the discounted
 * amount with a new RRR. That report is what the admin needs to see, so this
 * shows it rather than closing on success.
 */
export default function AddDiscountedStudent({
  isOpen,
  onClose,
}: AddDiscountedStudentProps) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [report, setReport] = useState<Partial<RepriceReport> | null>(null);

  const { mutate: addDiscount, isPending } = useAddCertificateDiscount();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const reg = registrationNumber.trim();
    if (!reg) return;
    const amount = Number(discountAmount);
    addDiscount(
      {
        registrationNumber: reg,
        ...(studentName.trim() ? { studentName: studentName.trim() } : {}),
        ...(discountAmount && Number.isFinite(amount)
          ? { discountAmount: amount }
          : {}),
      },
      { onSuccess: (res) => setReport(res.data ?? {}) },
    );
  };

  if (report) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Discount Added"
        subtitle={registrationNumber}
        icon={<Percent size={16} />}
        size="medium"
        footer={
          <button className="modal-submit" type="button" onClick={onClose}>
            Done
          </button>
        }
      >
        <RepriceReportSummary report={report} />
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Discounted Student"
      subtitle="Mark one student as pre-paid for their certificate fee"
      icon={<Percent size={16} />}
      size="medium"
      footer={
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
            form="add-discount-form"
            type="submit"
            disabled={isPending || !registrationNumber.trim()}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Add Discount"
            )}
          </button>
        </>
      }
    >
      <form
        id="add-discount-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
          }}
        >
          If this student already has an outstanding certificate invoice at the
          full fee, it is reissued at the discounted amount with a new payment
          reference, and they are notified automatically.
        </p>

        <div className="form-group">
          <label className="modal-label">
            Registration Number <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            required
            autoFocus
            type="text"
            className="modal-input"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="e.g. 19E/0039/PS"
          />
        </div>

        <div className="form-group">
          <label className="modal-label">Student Name</label>
          <input
            type="text"
            className="modal-input"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Optional — helps identify the row later"
          />
        </div>

        <div className="form-group">
          <label className="modal-label">Discount Amount (₦)</label>
          <input
            type="number"
            min={0}
            step={50}
            className="modal-input"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            placeholder="Leave blank to use the configured default"
          />
        </div>
      </form>
    </CustomModal>
  );
}
