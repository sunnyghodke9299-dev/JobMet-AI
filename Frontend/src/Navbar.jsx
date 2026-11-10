
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./App.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("jobmate_user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setUser(null);
    }

    setProfileOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }) =>
    isActive ? "active" : "";

  const goToPage = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("jobmate_token");
    localStorage.removeItem("jobmate_user");

    setUser(null);
    setProfileOpen(false);

    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        JobMate AI
      </Link>

      {/* Main navigation */}
      <div className="nav-links">
        <NavLink to="/" end className={navClass}>
          Home
        </NavLink>

        <NavLink to="/jobs" className={navClass}>
          Jobs
        </NavLink>

        <NavLink to="/resume-analyzer" className={navClass}>
          Resume Analyzer
        </NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}

            {/* Profile dropdown */}
            <div className="profile-menu-container">
              <button
                type="button"
                className="profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="profile-avatar">
                  {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="profile-trigger-name">
                  {user.name || "My Profile"}
                </span>

                <span className="profile-chevron">
                  {profileOpen ? "▴" : "▾"}
                </span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-details">
                    <strong>{user.name || "User"}</strong>
                    <span>{user.email || ""}</span>
                  </div>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/profile")}
                  >
                    <span className="profile-menu-icon">♙</span>
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/applications")}
                  >
                    <span className="profile-menu-icon">▤</span>
                    <span>My Applications</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/saved-jobs")}
                  >
                    <span className="profile-menu-icon">♡</span>
                    <span>My Saved Jobs</span>
                  </button>

                  {/* Interview History */}
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/interview-history")}
                  >
                    <span className="profile-menu-icon">📊</span>
                    <span>Interview History</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/dashboard")}
                  >
                    <span className="profile-menu-icon">▦</span>
                    <span>My Dashboard</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => goToPage("/settings")}
                  >
                    <span className="profile-menu-icon">⚙</span>
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="profile-menu-icon">↪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>

            <Link to="/register" className="get-started-link">
              <button type="button">Get Started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
