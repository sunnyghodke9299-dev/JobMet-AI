
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultSettings = {
  jobAlerts: true,
  applicationUpdates: true,
  careerTips: false,
  productNews: false,
  emailFrequency: "Immediately",
  targetRole: "Frontend Developer",
  workPreference: "Any",
  preferredLocation: "",
};

function Settings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState(defaultSettings);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("jobmate_user") || "null"
      );

      const savedSettings = JSON.parse(
        localStorage.getItem("jobmate_settings") || "null"
      );

      setUser(savedUser);

      if (savedSettings && typeof savedSettings === "object") {
        setSettings({
          ...defaultSettings,
          ...savedSettings,
        });
      }
    } catch {
      setUser(null);
      setSettings(defaultSettings);
    }
  }, []);

  const changeSetting = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      localStorage.setItem("jobmate_settings", JSON.stringify(settings));
      setMessage("Your preferences have been saved in this browser.");
    } catch {
      setError("Settings could not be saved. Please try again.");
    }
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError("Please complete all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    setMessage(
      "Password validation passed. Changing your actual account password requires the secure backend API, which is not connected yet."
    );
  };

  const tabs = [
    { id: "account", icon: "♙", label: "Account" },
    { id: "notifications", icon: "♧", label: "Notifications" },
    { id: "career", icon: "✧", label: "Career Preferences" },
    { id: "security", icon: "◇", label: "Security" },
  ];

  return (
    <main className="st-page">
      <div className="st-container">

        {/* Page header */}
        <header className="st-header">
          <div>
            <span className="st-eyebrow">✦ PERSONALISE YOUR EXPERIENCE</span>
            <h1>
              Account <span>Settings</span>
            </h1>
            <p>
              Manage your account, control your notifications and customise
              JobMate AI for your career goals.
            </p>
          </div>

          <button
            type="button"
            className="st-back-btn"
            onClick={() => navigate("/profile")}
          >
            ← My Profile
          </button>
        </header>

        {/* Account summary */}
        <section className="st-account-banner">
          <div className="st-account-avatar">
            {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="st-account-identity">
            <span className="st-member-label">YOUR ACCOUNT</span>
            <h2>{user?.name || "JobMate AI Member"}</h2>
            <p>{user?.email || "Account email unavailable"}</p>
          </div>

          <button
            type="button"
            className="st-edit-profile-btn"
            onClick={() => navigate("/profile")}
          >
            Edit Profile <span>↗</span>
          </button>
        </section>

        {message && (
          <div className="st-message" role="status">
            <span>✓</span>
            <p>{message}</p>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="st-error" role="alert">
            <span>!</span>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="st-settings-layout">

          {/* Settings navigation */}
          <aside className="st-settings-sidebar">
            <span className="st-sidebar-heading">SETTINGS MENU</span>

            <nav aria-label="Settings sections">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage("");
                    setError("");
                  }}
                >
                  <span className="st-tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="st-tab-arrow">›</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="st-help-card">
              <span>✦</span>
              <strong>Need help?</strong>
              <p>Keep your account information accurate and up to date.</p>
              <button
                type="button"
                onClick={() => navigate("/profile")}
              >
                View Profile →
              </button>
            </div>
          </aside>

          {/* Settings content */}
          <section className="st-settings-content">

            {/* Account */}
            {activeTab === "account" && (
              <article className="st-panel">
                <div className="st-panel-heading">
                  <div>
                    <span className="st-section-label">ACCOUNT OVERVIEW</span>
                    <h2>Account Information</h2>
                    <p>
                      Review your registered account details.
                    </p>
                  </div>
                  <span className="st-heading-icon purple">♙</span>
                </div>

                <div className="st-readonly-field">
                  <div>
                    <label>Full name</label>
                    <strong>{user?.name || "Not available"}</strong>
                  </div>
                  <span className="st-readonly-badge">Account</span>
                </div>

                <div className="st-readonly-field">
                  <div>
                    <label>Registered email</label>
                    <strong>{user?.email || "Not available"}</strong>
                  </div>
                  <span className="st-readonly-badge">Account</span>
                </div>

                <div className="st-information-note">
                  <span>ⓘ</span>
                  <p>
                    Your registered name and email are currently managed by
                    your account. Use My Profile to review your additional
                    personal and career details.
                  </p>
                </div>

                <div className="st-panel-actions">
                  <button
                    type="button"
                    className="st-primary-btn"
                    onClick={() => navigate("/profile")}
                  >
                    Open My Profile <span>→</span>
                  </button>
                </div>
              </article>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <form className="st-panel" onSubmit={saveSettings}>
                <div className="st-panel-heading">
                  <div>
                    <span className="st-section-label">STAY INFORMED</span>
                    <h2>Notification Preferences</h2>
                    <p>
                      Choose the updates you want to receive.
                    </p>
                  </div>
                  <span className="st-heading-icon pink">♧</span>
                </div>

                <div className="st-toggle-row">
                  <div className="st-toggle-copy">
                    <span className="st-toggle-symbol purple">▣</span>
                    <div>
                      <strong>Job alerts</strong>
                      <p>Get notified about relevant career opportunities.</p>
                    </div>
                  </div>

                  <label className="st-switch">
                    <input
                      type="checkbox"
                      checked={settings.jobAlerts}
                      onChange={(event) =>
                        changeSetting("jobAlerts", event.target.checked)
                      }
                    />
                    <span className="st-switch-track" />
                  </label>
                </div>

                <div className="st-toggle-row">
                  <div className="st-toggle-copy">
                    <span className="st-toggle-symbol green">✓</span>
                    <div>
                      <strong>Application updates</strong>
                      <p>Keep track of changes to your applications.</p>
                    </div>
                  </div>

                  <label className="st-switch">
                    <input
                      type="checkbox"
                      checked={settings.applicationUpdates}
                      onChange={(event) =>
                        changeSetting(
                          "applicationUpdates",
                          event.target.checked
                        )
                      }
                    />
                    <span className="st-switch-track" />
                  </label>
                </div>

                <div className="st-toggle-row">
                  <div className="st-toggle-copy">
                    <span className="st-toggle-symbol blue">✧</span>
                    <div>
                      <strong>Career tips</strong>
                      <p>Receive ideas for skills, resumes and interviews.</p>
                    </div>
                  </div>

                  <label className="st-switch">
                    <input
                      type="checkbox"
                      checked={settings.careerTips}
                      onChange={(event) =>
                        changeSetting("careerTips", event.target.checked)
                      }
                    />
                    <span className="st-switch-track" />
                  </label>
                </div>

                <div className="st-toggle-row">
                  <div className="st-toggle-copy">
                    <span className="st-toggle-symbol orange">✦</span>
                    <div>
                      <strong>Product news</strong>
                      <p>Hear about new JobMate AI features.</p>
                    </div>
                  </div>

                  <label className="st-switch">
                    <input
                      type="checkbox"
                      checked={settings.productNews}
                      onChange={(event) =>
                        changeSetting("productNews", event.target.checked)
                      }
                    />
                    <span className="st-switch-track" />
                  </label>
                </div>

                <div className="st-field st-frequency-field">
                  <label htmlFor="st-frequency">Preferred email frequency</label>
                  <select
                    id="st-frequency"
                    value={settings.emailFrequency}
                    onChange={(event) =>
                      changeSetting("emailFrequency", event.target.value)
                    }
                  >
                    <option>Immediately</option>
                    <option>Daily digest</option>
                    <option>Weekly digest</option>
                  </select>
                  <small>
                    These preferences are saved locally for now; email
                    notifications have not been connected yet.
                  </small>
                </div>

                <div className="st-panel-actions">
                  <button type="submit" className="st-primary-btn">
                    Save Preferences <span>✓</span>
                  </button>
                </div>
              </form>
            )}

            {/* Career preferences */}
            {activeTab === "career" && (
              <form className="st-panel" onSubmit={saveSettings}>
                <div className="st-panel-heading">
                  <div>
                    <span className="st-section-label">PERSONALISE YOUR SEARCH</span>
                    <h2>Career Preferences</h2>
                    <p>
                      Set your preferred role and working arrangement.
                    </p>
                  </div>
                  <span className="st-heading-icon purple">✧</span>
                </div>

                <div className="st-form-grid">
                  <div className="st-field">
                    <label htmlFor="st-target-role">Target job role</label>
                    <select
                      id="st-target-role"
                      value={settings.targetRole}
                      onChange={(event) =>
                        changeSetting("targetRole", event.target.value)
                      }
                    >
                      <option>Frontend Developer</option>
                      <option>Python Developer</option>
                      <option>Full Stack Developer</option>
                      <option>Data Analyst</option>
                      <option>Data Scientist</option>
                      <option>AI/ML Engineer</option>
                      <option>Software Developer</option>
                    </select>
                  </div>

                  <div className="st-field">
                    <label htmlFor="st-work-preference">Work preference</label>
                    <select
                      id="st-work-preference"
                      value={settings.workPreference}
                      onChange={(event) =>
                        changeSetting("workPreference", event.target.value)
                      }
                    >
                      <option>Any</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>

                  <div className="st-field st-full-field">
                    <label htmlFor="st-preferred-location">
                      Preferred location
                    </label>
                    <input
                      id="st-preferred-location"
                      type="text"
                      maxLength={100}
                      value={settings.preferredLocation}
                      onChange={(event) =>
                        changeSetting("preferredLocation", event.target.value)
                      }
                      placeholder="e.g. Pune, Mumbai or Remote"
                    />
                  </div>
                </div>

                <div className="st-information-note">
                  <span>✦</span>
                  <p>
                    These preferences are saved in this browser. They will
                    affect real job recommendations after the backend is
                    connected to your account and job data.
                  </p>
                </div>

                <div className="st-panel-actions">
                  <button type="submit" className="st-primary-btn">
                    Save Career Preferences <span>✓</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <form className="st-panel" onSubmit={handlePasswordSubmit}>
                <div className="st-panel-heading">
                  <div>
                    <span className="st-section-label">ACCOUNT PROTECTION</span>
                    <h2>Password & Security</h2>
                    <p>
                      Review your account security settings.
                    </p>
                  </div>
                  <span className="st-heading-icon green">◇</span>
                </div>

                <div className="st-security-banner">
                  <span>♧</span>
                  <div>
                    <strong>Protect your account</strong>
                    <p>
                      Use a strong, unique password and never share your
                      login credentials.
                    </p>
                  </div>
                </div>

                <div className="st-field st-security-field">
                  <label htmlFor="st-current-password">Current password</label>
                  <input
                    id="st-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={passwordData.currentPassword}
                    onChange={(event) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: event.target.value,
                      })
                    }
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="st-field st-security-field">
                  <label htmlFor="st-new-password">New password</label>
                  <input
                    id="st-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={(event) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: event.target.value,
                      })
                    }
                    placeholder="At least 8 characters"
                  />
                  <small>
                    Use at least 8 characters. Avoid using a password
                    you already use elsewhere.
                  </small>
                </div>

                <div className="st-field st-security-field">
                  <label htmlFor="st-confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="st-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={(event) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: event.target.value,
                      })
                    }
                    placeholder="Enter your new password again"
                  />
                </div>

                <div className="st-information-note">
                  <span>ⓘ</span>
                  <p>
                    Password changes are not yet connected to the backend.
                    This form validates input only and does not change or store
                    your password.
                  </p>
                </div>

                <div className="st-panel-actions">
                  <button
                    type="submit"
                    className="st-primary-btn"
                  >
                    Validate Password Form <span>→</span>
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <footer className="st-footer">
          <span>✦ JobMate AI</span>
          <p>Your account. Your choices. Your career journey.</p>
        </footer>
      </div>
    </main>
  );
}

export default Settings;
