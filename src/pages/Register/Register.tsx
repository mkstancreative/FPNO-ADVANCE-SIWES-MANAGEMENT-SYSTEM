import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import "../Login/Login.css";
import "./Register.css";
import { useRegisterStudent } from "../../hooks/useAuth";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveLogo, resolveName } from "../../utils/branding";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const { data: settingsData } = useSystemSettings();
  const settings = settingsData?.settings;
  const appName = resolveName(settings);
  const logo = resolveLogo(settings);

  return (
    <div className="register-page-container">
      <div className="register-card-wrapper">
        <div className="register-card">
          <div className="register-brand">
            <div className="register-brand-logo">
              <img src={logo} alt="logo" width={36} height={36} />
            </div>
            <span className="register-brand-name">{appName}</span>
          </div>

          <h1 className="register-card-title">Create an Account</h1>
          <p className="register-card-sub">Student Registration Portal</p>

          {error && (
            <div className="login-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-grid">
              <div className="register-form-group">
                <label className="form-label" htmlFor="firstName">
                  First Name
                </label>
                <div className="form-input-wrap">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="form-input"
                    placeholder="Mary"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="lastName">
                  Last Name
                </label>
                <div className="form-input-wrap">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="form-input"
                    placeholder="Johnson"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <div className="form-input-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    className="form-input"
                    placeholder="you@fpno.edu.ng"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <div className="form-input-wrap">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    className="form-input"
                    placeholder="08098765432"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="registrationNumber">
                  Registration Number
                </label>
                <div className="form-input-wrap">
                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    className="form-input"
                    placeholder="2024/ENG/045"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    autoCapitalize="characters"
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="departmentName">
                  Department
                </label>
                <div className="form-input-wrap">
                  <input
                    id="departmentName"
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

              <div className="register-form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="form-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input has-icon"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="register-icon-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
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
                        width="18"
                        height="18"
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
                  </button>
                </div>
              </div>

              <div className="register-form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="form-input-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input has-icon"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="register-icon-btn"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        width="18"
                        height="18"
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
                        width="18"
                        height="18"
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
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={isPending}
            >
              {isPending ? "Creating Account…" : "Register"}
            </button>

            <div className="register-footer">
              <span className="register-footer-text">
                Already have an account?{" "}
              </span>
              <Link to="/" className="register-footer-link">
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
