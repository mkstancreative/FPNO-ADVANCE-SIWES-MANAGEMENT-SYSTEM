import { useState, type FormEvent } from "react";
import { Settings2, UploadCloud } from "lucide-react";
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from "../../hooks/useSettings";
import Spinner from "../../components/ui/Spinner/Spinner";

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/api(\/v\d+)?\/?$/,
  "",
);

function logoSrc(logo: string) {
  if (!logo) return "";
  if (/^https?:\/\//.test(logo)) return logo;
  return `${apiBase}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

const logoUrl = (settings: { logo?: { url: string } } | undefined) =>
  settings?.logo?.url ?? "";

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const EMPTY_FORM: FormState = { name: "", phone: "", email: "", address: "" };

export default function SystemSettings() {
  const { data, isLoading } = useSystemSettings();
  const { mutate: save, isPending } = useUpdateSystemSettings();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [hasSeeded, setHasSeeded] = useState(false);
  const settings = data?.settings;
  if (settings && !hasSeeded) {
    setHasSeeded(true);
    setForm({
      name: settings.name,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
    });
    setLogoPreview(logoSrc(logoUrl(settings)));
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoPreview(
      file ? URL.createObjectURL(file) : logoSrc(logoUrl(data?.settings)),
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    formData.append("address", form.address);
    if (logoFile) formData.append("logo", logoFile);
    save(formData, { onSuccess: () => setLogoFile(null) });
  };

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

  return (
    <div className="page-container">
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
      </div>

      <div 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 24,
      }}
      >
        <form
          onSubmit={handleSubmit}
          className="form-grid"
          style={{
            maxWidth: 640,
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 24,
            backgroundColor: "var(--color-bg-secondary)",
          }}
        >
          {/* ── Logo ── */}
          <div className="form-group col-1">
            <label className="modal-label">Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
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
                    alt="Portal logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <UploadCloud size={22} color="#94a3b8" />
                )}
              </div>
              <label
                className="modal-cancel"
                style={{ cursor: "pointer", margin: 0 }}
              >
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
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8" }}>
              Optional — leave blank to keep the existing logo.
            </p>
          </div>

          {/* ── Name ── */}
          <div className="form-group col-2">
            <label className="modal-label">
              Portal Name <span>*</span>
            </label>
            <input
              className="modal-input"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="FPNO SIWES Portal"
            />
          </div>

          {/* ── Phone ── */}
          <div className="form-group col-2">
            <label className="modal-label">
              Phone <span>*</span>
            </label>
            <input
              className="modal-input"
              required
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="08031234567"
            />
          </div>

          {/* ── Email ── */}
          <div className="form-group col-2">
            <label className="modal-label">
              Email <span>*</span>
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

          {/* ── Address ── */}
          <div className="form-group col-2">
            <label className="modal-label">
              Address <span>*</span>
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

          <div className="form-group col-1" style={{ marginTop: 8 }}>
            <button type="submit" className="modal-submit" disabled={isPending}>
              {isPending ? <Spinner size={14} color="#fff" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
