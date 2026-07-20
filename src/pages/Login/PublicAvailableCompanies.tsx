import { useNavigate } from "react-router-dom";
import AvailableCompanies from "../Students/AvailableCompanies";
import { ChevronLeft } from "lucide-react";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveLogo, resolveName } from "../../utils/branding";
import "../Login/Login.css";

const responsiveStyles = `
  @media (max-width: 768px) {
    .public-companies-header {
      padding: 16px 20px !important;
    }
    .public-companies-content {
      padding: 30px 20px !important;
    }
  }
`;

export default function PublicAvailableCompanies() {
  const navigate = useNavigate();
  const { data } = useSystemSettings();
  const settings = data?.settings;
  const appName = resolveName(settings);
  const logo = resolveLogo(settings);

  return (
    <div
      style={{
      
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1f2d 100%)",
        color: "#fff",
        minHeight: "100vh",
        margin: "0 auto",
      }}
    >
      <style>{responsiveStyles}</style>
      <div
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1f2d 100%)",
        }}
      >
        {/* Header with Back Button */}
        <div
          className="public-companies-header"
          style={{
            padding: "20px 80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(45, 212, 191, 0.1)",
            maxWidth: "1300px",
            margin: "0 auto",
          
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={logo} alt="Logo" style={{ width: 36, height: 36 }} />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {appName}
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(45, 212, 191, 0.1)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              color: "#2dd4bf",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(45, 212, 191, 0.15)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(45, 212, 191, 0.1)";
            }}
          >
            <ChevronLeft size={16} />
            Back to Login
          </button>
        </div>

        {/* Available Companies Content */}
        <div
          className="public-companies-content"
          style={{
            padding: "60px 80px",
            maxWidth: "1300px",
            margin: "0 auto",
          }}
        >
          <AvailableCompanies />
        </div>
      </div>
    </div>
  );
}
