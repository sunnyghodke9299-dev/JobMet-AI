import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      // Save JWT token
      localStorage.setItem(
        "jobmate_token",
        data.access_token
      );

      // Save basic user information
      localStorage.setItem(
        "jobmate_user",
        JSON.stringify(data.user)
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      setError(
        "Unable to connect to server. Please make sure Flask is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          JobMate AI
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue your career journey.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">

            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">
              Forgot Password?
            </a>

          </div>

          {error && (
            <div className="login-error">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}

          <Link to="/register">
  Create Account
</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;