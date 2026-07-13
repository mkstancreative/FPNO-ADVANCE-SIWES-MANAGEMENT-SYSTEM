import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Users,
  Globe,
  CheckCircle2,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import type { Company } from "../../../api/types/company";
import "./CompanyDetailModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

export default function CompanyDetailModal({
  isOpen,
  onClose,
  company,
}: Props) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={company.companyName}
      subtitle="Company details & placement information"
      icon={<Building2 size={16} />}
    >
      <div className="cdm-root">
        {/* ── Verified banner ─────────────────────────────────────────── */}
        <div className="cdm-verified-banner">
          <CheckCircle2 size={14} />
          Verified &amp; Accepting IT Students
        </div>

        {/* ── Info grid ───────────────────────────────────────────────── */}
        <div className="cdm-grid">
          <InfoItem
            icon={<Building2 size={14} />}
            label="Company"
            value={company.companyName}
          />
          <InfoItem
            icon={<Briefcase size={14} />}
            label="Industry"
            value={company.industry}
          />
          <InfoItem
            icon={<Globe size={14} />}
            label="Type"
            value={
              company.companyType.charAt(0).toUpperCase() +
              company.companyType.slice(1)
            }
          />
          <InfoItem
            icon={<MapPin size={14} />}
            label="Location"
            value={`${company.address.street}, ${company.address.city}, ${company.address.state}`}
          />
          <InfoItem
            icon={<Phone size={14} />}
            label="Phone"
            value={company.phone}
          />
          <InfoItem
            icon={<Mail size={14} />}
            label="Email"
            value={company.email}
          />
          <InfoItem
            icon={<Users size={14} />}
            label="Total Students Hosted"
            value={String(company.studentCount)}
          />
        </div>

        {/* ── CTA note ────────────────────────────────────────────────── */}
        <div className="cdm-cta-note">
          <p>
            Interested in this company? Go to the <strong>Placement</strong>{" "}
            page to submit your acceptance letter and request a placement here.
          </p>
        </div>
      </div>
    </CustomModal>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value || value === "undefined") return null;
  return (
    <div className="cdm-info-item">
      <div className="cdm-info-label">
        {icon}
        {label}
      </div>
      <div className="cdm-info-value">{value}</div>
    </div>
  );
}
