
import { useState } from "react";

function Register({
  onRegister,
  onNavigate,
  error = "",
  loading = false
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setValidationError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (onRegister) {
      onRegister({ username, email, password });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Phish Outta Water</h1>
        <p className="auth-subtitle">
          Email Security Analyzer
        </p>

        <h2>Create Account</h2>
        <p className="auth-description">
          Create an account to save and track your email analyses.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Create a password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <label htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {(validationError || error) && (
            <p className="auth-error">
              {validationError || error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate("login")}
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
