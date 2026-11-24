
import { useState } from "react";

function Login({ onLogin, onNavigate, error = "", loading = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    if (onLogin) {
      onLogin({ email, password });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Phish Outta Water</h1>
        <p className="auth-subtitle">
          Email Security Analyzer
        </p>

        <h2>Welcome Back</h2>
        <p className="auth-description">
          Log in to analyze suspicious emails and view your scan history.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigate("register")}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
