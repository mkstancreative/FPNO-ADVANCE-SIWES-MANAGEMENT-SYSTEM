import {
  Building,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Users,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import type { Company } from "../../../api/types/company";
import { formatDate } from "../../../helpers/utilities";
import "./UnverifiedComapnyView.css";

interface UnverifiedComapnyViewProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export default function UnverifiedComapnyView({
  isOpen,
  onClose,
  company,
}: UnverifiedComapnyViewProps) {
  if (!company) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Details"
      subtitle="Comprehensive view of unverified company profile"
      icon={<Building size={16} />}
      size="wide"
    >
      <div className="ucv-root">
        {/* ── Status Header ── */}
        <div className="ucv-status-banner pending">
          <Clock size={16} />
          <span>
            This company is currently awaiting administrative verification.
          </span>
        </div>

        {/* ── Hero Section ── */}
        <div className="ucv-hero">
          <div className="ucv-icon-wrap">
            <Building size={32} />
          </div>
          <div className="ucv-hero-info">
            <h2 className="ucv-name">{company.companyName}</h2>
            <div className="ucv-industry-row">
              <span className="ucv-industry">
                <Briefcase size={14} />
                {company.industry}
              </span>
              <span className="ucv-type-badge">{company.companyType}</span>
            </div>
          </div>
        </div>

        {/* ── Details Grid ── */}
        <div className="ucv-grid">
          {/* General Information */}
          <div className="ucv-card">
            <div className="ucv-card-header">
              <ShieldAlert size={14} color="var(--color-text-secondary)" />
              <h3 className="ucv-card-title">General Information</h3>
            </div>
            <div className="ucv-card-body">
              <InfoRow label="Company ID" value={company._id} />
              <InfoRow label="Industry" value={company.industry} />
              <InfoRow label="Company Type" value={company.companyType} />
              <InfoRow
                label="Registered On"
                value={formatDate(company.createdAt)}
              />
              <InfoRow label="Status" value="Pending Verification" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="ucv-card">
            <div className="ucv-card-header">
              <Phone size={14} color="var(--color-text-secondary)" />
              <h3 className="ucv-card-title">Contact & Location</h3>
            </div>
            <div className="ucv-card-body">
              <InfoRow
                label="Email Address"
                value={company.email}
                isLink
                linkHref={`mailto:${company.email}`}
              />
              <InfoRow
                label="Phone Number"
                value={company.phone}
                isLink
                linkHref={`tel:${company.phone}`}
              />
              <InfoRow label="Street" value={company.address.street} />
              <InfoRow label="City / LGA" value={company.address.city} />
              <InfoRow label="State" value={company.address.state} />
            </div>
          </div>

          {/* Onboarding Info */}
          <div className="ucv-card">
            <div className="ucv-card-header">
              <GraduationCap size={14} color="var(--color-text-secondary)" />
              <h3 className="ucv-card-title">Onboarded By</h3>
            </div>
            <div className="ucv-card-body">
              {company.onboardedBy?.student ? (
                <>
                  <InfoRow
                    label="Student Reg #"
                    value={company.onboardedBy.student.registrationNumber}
                  />
                  <InfoRow
                    label="Department"
                    value={company.onboardedBy.student.department.name}
                  />
                  <div
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <AlertCircle
                      size={12}
                      style={{ marginRight: 4, display: "inline" }}
                    />
                    This company was added by a student during their placement
                    request.
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                  }}
                >
                  Self-registered or direct entry.
                </div>
              )}
            </div>
          </div>

          {/* Industrial Supervisors */}
          <div className="ucv-card">
            <div className="ucv-card-header">
              <Users size={14} color="var(--color-text-secondary)" />
              <h3 className="ucv-card-title">Clinical Supervisors</h3>
            </div>
            <div className="ucv-supervisor-list">
              {company.supervisors && company.supervisors.length > 0 ? (
                company.supervisors.map((sup) => (
                  <div key={sup._id} className="ucv-sup-item">
                    <div className="ucv-sup-top">
                      <span className="ucv-sup-name">{sup.name}</span>
                      <span className="ucv-sup-pos">{sup.position}</span>
                    </div>
                    <div className="ucv-sup-contact">
                      <div className="ucv-sup-meta">
                        <Mail size={12} /> {sup.email}
                      </div>
                      <div className="ucv-sup-meta">
                        <Phone size={12} /> {sup.phone}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                  }}
                >
                  No Clinical supervisors listed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}

function InfoRow({
  label,
  value,
  isLink,
  linkHref,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  linkHref?: string;
}) {
  return (
    <div className="ucv-info-row">
      <span className="ucv-label">{label}</span>
      {isLink ? (
        <a
          href={linkHref}
          className="ucv-value link"
          target="_blank"
          rel="noreferrer"
        >
          {value} <ExternalLink size={10} style={{ marginLeft: 2 }} />
        </a>
      ) : (
        <span className="ucv-value">{value}</span>
      )}
    </div>
  );
}
