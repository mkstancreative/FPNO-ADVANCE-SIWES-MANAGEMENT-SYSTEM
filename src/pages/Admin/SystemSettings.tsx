import { useState, type FormEvent } from "react";
import {
  Settings2,
  UploadCloud,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
  ImageIcon,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from "../../hooks/useSettings";
import Spinner from "../../components/ui/Spinner/Spinner";
import { logoSrc } from "../../utils/branding";
import type { SystemSettings as SystemSettingsData } from "../../api/types/settings";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const logoUrl = (settings: SystemSettingsData | undefined) =>
  logoSrc(settings?.logo?.url);

/* ── types ───────────────────────────────────────────────────────────────── */
interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  code: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  code: "",
};

/* ── sub-components ──────────────────────────────────────────────────────── */

/** A read-only info row used inside the live-preview card */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          color: "var(--color-accent)",
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: value
              ? "var(--color-text-primary)"
              : "var(--color-text-subtle)",
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────────────── */
export default function SystemSettings() {
  const { data, isLoading } = useSystemSettings();
  const { mutate: save, isPending } = useUpdateSystemSettings();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [hasSeeded, setHasSeeded] = useState(false);

  const settings = data?.settings;

  /* seed form once from API */
  if (settings && !hasSeeded) {
    setHasSeeded(true);
    setForm({
      name: settings.name ?? "",
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      address: settings.address ?? "",
      code: settings.code ?? "",
    });
    setLogoPreview(logoUrl(settings));
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoPreview(
      file ? URL.createObjectURL(file) : logoUrl(data?.settings),
    );
  };

  const handleReset = () => {
    if (!settings) return;
    setForm({
      name: settings.name ?? "",
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      address: settings.address ?? "",
      code: settings.code ?? "",
    });
    setLogoFile(null);
    setLogoPreview(logoUrl(settings));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("email", form.email);
    fd.append("address", form.address);
    fd.append("code", form.code);
    if (logoFile) fd.append("logo", logoFile);
    save(fd, { onSuccess: () => setLogoFile(null) });
  };

  /* loading state */
  if (isLoading) {
    return (
      <div
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner
          size={28}
          color="var(--color-accent)"
          text="Loading settings…"
        />
      </div>
    );
  }

  /* ── render ── */
  return (
    <div className="page-container">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="page-title">System Settings</h2>
            <p className="page-sub">
              Portal branding and contact details shown across the site
            </p>
          </div>
        </div>

        <div className="page-header-right">
          {/* Live portal badge */}
          {settings && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                background: "var(--color-accent-muted)",
                border: "1px solid var(--color-accent-border)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-accent)",
              }}
            >
              <CheckCircle2 size={13} />
              Portal Active
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column layout: form (left) + preview (right) ────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── Edit Form ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            padding: "24px 28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Form section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 22,
              paddingBottom: 14,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                Edit Portal Details
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                Changes take effect immediately after saving
              </div>
            </div>
            {settings && (
              <button
                type="button"
                onClick={handleReset}
                className="dash-btn dash-btn--ghost"
                style={{ height: 34, fontSize: 12.5 }}
              >
                <RefreshCw size={13} />
                Reset
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Logo */}
            <div className="form-group col-1">
              <label className="modal-label">Portal Logo</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px dashed var(--color-accent-border)",
                  background: "var(--color-accent-muted)",
                }}
              >
                {/* Preview thumbnail */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Portal logo preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <ImageIcon size={22} color="#94a3b8" />
                  )}
                </div>

                {/* Upload label / trigger */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label
                    className="modal-cancel"
                    style={{
                      cursor: "pointer",
                      margin: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <UploadCloud size={14} />
                    {logoFile ? logoFile.name : "Choose image…"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleLogoChange(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    PNG, JPG or SVG · Leave blank to keep existing logo
                  </p>
                </div>

                {/* Clear selection */}
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => handleLogoChange(null)}
                    style={{
                      background: "none",
                      border: "1px solid var(--color-border)",
                      borderRadius: 7,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Name + Code */}
            <div className="form-group col-2">
              <label className="modal-label">
                Portal Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="FPNO SIWES Portal"
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">
                Portal Code <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                placeholder="SIWES"
                maxLength={20}
              />
            </div>

            {/* Phone */}
            <div className="form-group col-2">
              <label className="modal-label">
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="08031234567"
              />
            </div>

            {/* Email */}
            <div className="form-group col-2">
              <label className="modal-label">
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email"
                className="modal-input"
                required
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="siwes@fpno.edu.ng"
              />
            </div>

            {/* Address */}
            <div className="form-group col-1">
              <label className="modal-label">
                Physical Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                minLength={10}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Federal Polytechnic Nekede, Owerri, Imo State"
              />
            </div>

            {/* ── Submit ────────────────────────────────────────────── */}
            <div className="form-group col-1" style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="modal-submit"
                disabled={isPending}
                style={{ width: "100%", padding: "11px 22px", fontSize: 14 }}
              >
                {isPending ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Spinner size={14} color="#fff" />
                    Saving…
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <CheckCircle2 size={15} />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Live Preview Card ──────────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 88,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Current logo + name pill */}
          <div
            style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: 14,
              padding: 20,
              boxShadow: "var(--shadow-sm)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                margin: "0 auto 12px",
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Building2 size={28} color="#94a3b8" />
              )}
            </div>

            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              {form.name || "Portal Name"}
            </div>

            {form.code && (
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: 20,
                  background: "var(--color-accent-muted)",
                  border: "1px solid var(--color-accent-border)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  letterSpacing: "0.06em",
                }}
              >
                {form.code}
              </span>
            )}
          </div>

          {/* Details */}
          <div
            style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Live Preview
            </div>

            <InfoRow icon={<Hash size={14} />} label="Code" value={form.code} />
            <InfoRow
              icon={<Phone size={14} />}
              label="Phone"
              value={form.phone}
            />
            <InfoRow
              icon={<Mail size={14} />}
              label="Email"
              value={form.email}
            />
            <InfoRow
              icon={<MapPin size={14} />}
              label="Address"
              value={form.address}
            />
          </div>

          {/* Hint */}
          <p
            style={{
              fontSize: 11.5,
              color: "var(--color-text-subtle)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            This preview updates as you type.
            <br />
            Click <b>Save Changes</b> to apply.
          </p>
        </div>
      </div>

      {/* ── Responsive override (stacks at narrow widths) ─────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .sys-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
