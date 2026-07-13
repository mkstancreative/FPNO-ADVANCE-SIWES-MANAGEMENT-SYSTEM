import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import "../Login/Login.css";
import { useRegisterStudent } from "../../hooks/useAuth";

const Register = () => {
  const { mutate: register, isPending } = useRegisterStudent();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    registrationNumber: "",
    departmentName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([k]) => k !== "confirmPassword"),
    ) as Omit<typeof formData, "confirmPassword">;

    register(payload);
  };

  const appName = "CIMS";

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111827 50%, #0d1f2d 100%)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        className="login-card-wrapper"
        style={{ width: "100%", maxWidth: 800 }}
      >
        <div className="login-card" style={{ maxWidth: "800px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
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
              <img src="/logo.png" alt="logo" width={36} height={36} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{appName}</span>
          </div>

          <div className="login-card-title">Create an Account</div>
          <div className="login-card-sub">Student Registration Portal</div>

          {error && (
            <div className="login-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px",
                marginBottom: 24,
              }}
            >
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="form-input-wrap">
                  <input
                    name="firstName"
                    type="text"
                    className="form-input"
                    placeholder="Mary"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="form-input-wrap">
                  <input
                    name="lastName"
                    type="text"
                    className="form-input"
                    placeholder="Johnson"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="form-input-wrap">
                  <input
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="form-input-wrap">
                  <input
                    name="phone"
                    type="text"
                    className="form-input"
                    placeholder="08098765432"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <div className="form-input-wrap">
                  <input
                    name="registrationNumber"
                    type="text"
                    className="form-input"
                    placeholder="2024/ENG/045"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div className="form-input-wrap">
                  <input
                    name="departmentName"
                    type="text"
                    className="form-input"
                    placeholder="Electrical Engineering"
                    value={formData.departmentName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    style={{ paddingRight: 40 }}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <span
                    className="input-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M1 1l22 22"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-wrap">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={isPending}
              style={{
                width: "100%",
                display: "block",
                marginTop: "24px",
              }}
            >
              {isPending ? "Creating Account…" : "Register"}
            </button>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
              <span style={{ color: "var(--color-text-muted)" }}>
                Already have an account?{" "}
              </span>
              <Link
                to="/"
                style={{
                  color: "var(--color-accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
