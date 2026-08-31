import { GraduationCap, FileText, ShieldCheck } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import type { VerifyRRRFlow } from "./AdminVerifyRRR";

interface RRRFlowPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (flow: VerifyRRRFlow) => void;
}

const OPTIONS: {
  flow: VerifyRRRFlow;
  icon: React.ReactNode;
  label: string;
  description: string;
  accent: string;
}[] = [
  {
    flow: "internship",
    icon: <GraduationCap size={22} />,
    label: "Internship Payment",
    description: "Platform students who pay an internship fee before placement.",
    accent: "var(--color-accent)",
  },
  {
    flow: "certificate",
    icon: <FileText size={22} />,
    label: "Certificate Payment",
    description:
      "Self-registered students who pay a certificate fee independently.",
    accent: "#7c3aed",
  },
];

export default function RRRFlowPicker({ isOpen, onClose, onSelect }: RRRFlowPickerProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify RRR"
      subtitle="Choose which payment type you want to verify"
      icon={<ShieldCheck size={18} />}
      size="default"
      footer={
        <button type="button" className="modal-cancel" onClick={onClose}>
          Cancel
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {OPTIONS.map(({ flow, icon, label, description, accent }) => (
          <button
            key={flow}
            type="button"
            onClick={() => onSelect(flow)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-secondary)",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--color-border)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-bg-secondary)";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--color-text-primary)",
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </CustomModal>
  );
}
