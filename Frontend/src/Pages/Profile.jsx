
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialProfile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  targetRole: "Frontend Developer",
  experience: "Fresher",
  employmentType: "Remote",
  skills: "",
  bio: "",
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("jobmate_user") || "{}"
      );

      const savedProfile = JSON.parse(
        localStorage.getItem("jobmate_profile") || "{}"
      );

      setProfile({
        ...initialProfile,
        fullName: savedUser.name || "",
        email: savedUser.email || "",
        ...savedProfile,
        // Registered email remains the account email.
        email: savedUser.email || savedProfile.email || "",
      });
    } catch {
      setProfile(initialProfile);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!profile.fullName.trim()) {
      setError("Please enter your full name.");
      setActiveTab("personal");
      return;
    }

    try {
      const savedProfile = {
        ...profile,
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim(),
        location: profile.location.trim(),
        headline: profile.headline.trim(),
        skills: profile.skills.trim(),
        bio: profile.bio.trim(),
      };

      localStorage.setItem(
        "jobmate_profile",
        JSON.stringify(savedProfile)
      );

      setProfile(savedProfile);
      setMessage("Your profile details have been saved successfully.");
    } catch {
      setError("Unable to save your profile in this browser.");
    }
  };

  const initials = profile.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

  const filledFields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.location,
    profile.headline,
    profile.targetRole,
    profile.skills,
    profile.bio,
  ].filter((value) => String(value || "").trim()).length;

  const completion = Math.round((filledFields / 8) * 100);

  const skillList = profile.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <main className="pf-page">
      <div className="pf-container">

        {/* Page heading */}
        <header className="pf-page-header">
          <div>
            <span className="pf-eyebrow">
              ✦ YOUR PERSONAL SPACE
            </span>

            <h1>My <span>Profile</span></h1>

            <p>
              Manage your information, showcase your skills and shape
              your career preferences in one place.
            </p>
          </div>

          <button
            type="button"
            className="pf-outline-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Profile hero */}
        <section className="pf-hero-card">
          <div className="pf-hero-decoration pf-decoration-one" />
          <div className="pf-hero-decoration pf-decoration-two" />

          <div className="pf-identity">
            <div className="pf-avatar">{initials}</div>

            <div className="pf-identity-info">
              <span className="pf-member-label">
                JOBMATE AI MEMBER
              </span>

              <h2>{profile.fullName || "Your Name"}</h2>

              <p>{profile.email || "Your registered email"}</p>

              <span className="pf-role-badge">
                ✦ {profile.targetRole}
              </span>
            </div>
          </div>

          <div className="pf-completion">
            <div className="pf-completion-heading">
              <span>Profile completion</span>
              <strong>{completion}%</strong>
            </div>

            <div
              className="pf-completion-track"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
            >
              <div style={{ width: `${completion}%` }} />
            </div>

            <p>
              {completion === 100
                ? "Your profile information is complete."
                : "Add your details to build a more complete career profile."}
            </p>
          </div>
        </section>

        {/* Status messages */}
        {message && (
          <div className="pf-message" role="status">
            <span>✓</span> {message}
          </div>
        )}

        {error && (
          <div className="pf-error" role="alert">
            <span>!</span> {error}
          </div>
        )}

        {/* Profile tabs */}
        <div className="pf-tabs" role="tablist" aria-label="Profile sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => {
              setActiveTab("overview");
              setMessage("");
              setError("");
            }}
          >
            <span>▦</span> Overview
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "personal"}
            className={activeTab === "personal" ? "active" : ""}
            onClick={() => {
              setActiveTab("personal");
              setMessage("");
              setError("");
            }}
          >
            <span>♙</span> Personal Details
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "career"}
            className={activeTab === "career" ? "active" : ""}
            onClick={() => {
              setActiveTab("career");
              setMessage("");
              setError("");
            }}
          >
            <span>✧</span> Career Preferences
          </button>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <section className="pf-overview">
            <div className="pf-content-grid">
              <article className="pf-card">
                <div className="pf-card-heading">
                  <div>
                    <span className="pf-section-label">
                      ABOUT YOU
                    </span>
                    <h3>Personal Information</h3>
                  </div>

                  <button
                    type="button"
                    className="pf-text-btn"
                    onClick={() => setActiveTab("personal")}
                  >
                    Edit <span>→</span>
                  </button>
                </div>

                <div className="pf-info-row">
                  <span className="pf-info-icon purple">♙</span>
                  <div>
                    <small>Full name</small>
                    <strong>{profile.fullName || "Not added yet"}</strong>
                  </div>
                </div>

                <div className="pf-info-row">
                  <span className="pf-info-icon pink">@</span>
                  <div>
                    <small>Email address</small>
                    <strong>{profile.email || "Not available"}</strong>
                  </div>
                </div>

                <div className="pf-info-row">
                  <span className="pf-info-icon blue">☎</span>
                  <div>
                    <small>Phone number</small>
                    <strong>{profile.phone || "Not added yet"}</strong>
                  </div>
                </div>

                <div className="pf-info-row">
                  <span className="pf-info-icon green">⌖</span>
                  <div>
                    <small>Location</small>
                    <strong>{profile.location || "Not added yet"}</strong>
                  </div>
                </div>
              </article>

              <article className="pf-card">
                <div className="pf-card-heading">
                  <div>
                    <span className="pf-section-label">
                      YOUR NEXT STEP
                    </span>
                    <h3>Career Preferences</h3>
                  </div>

                  <button
                    type="button"
                    className="pf-text-btn"
                    onClick={() => setActiveTab("career")}
                  >
                    Edit <span>→</span>
                  </button>
                </div>

                <div className="pf-preference-box">
                  <span className="pf-info-icon purple">✦</span>
                  <div>
                    <small>Target role</small>
                    <strong>{profile.targetRole}</strong>
                  </div>
                </div>

                <div className="pf-preference-box">
                  <span className="pf-info-icon pink">↗</span>
                  <div>
                    <small>Experience level</small>
                    <strong>{profile.experience}</strong>
                  </div>
                </div>

                <div className="pf-preference-box">
                  <span className="pf-info-icon blue">⌂</span>
                  <div>
                    <small>Preferred work style</small>
                    <strong>{profile.employmentType}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="pf-wide-btn"
                  onClick={() => navigate("/jobs")}
                >
                  Explore Jobs <span>→</span>
                </button>
              </article>
            </div>

            <article className="pf-card pf-skills-card">
              <div className="pf-card-heading">
                <div>
                  <span className="pf-section-label">
                    YOUR TOOLKIT
                  </span>
                  <h3>Skills & Strengths</h3>
                  <p>Add technologies and skills you know.</p>
                </div>

                <button
                  type="button"
                  className="pf-text-btn"
                  onClick={() => setActiveTab("career")}
                >
                  Manage Skills <span>→</span>
                </button>
              </div>

              {skillList.length > 0 ? (
                <div className="pf-skill-list">
                  {skillList.map((skill, index) => (
                    <span
                      className={`pf-skill-chip chip-${index % 4}`}
                      key={`${skill}-${index}`}
                    >
                      <span>✓</span> {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="pf-empty-skills">
                  <span>✧</span>
                  <p>No skills added yet. Add your skills in Career Preferences.</p>
                  <button
                    type="button"
                    className="pf-text-btn"
                    onClick={() => setActiveTab("career")}
                  >
                    Add Skills →
                  </button>
                </div>
              )}

              <div className="pf-bio-box">
                <h4>About me</h4>
                <p>
                  {profile.bio ||
                    "Add a short introduction about your interests, strengths and career goals."}
                </p>
              </div>
            </article>
          </section>
        )}

        {/* Personal details form */}
        {activeTab === "personal" && (
          <form className="pf-card pf-edit-card" onSubmit={handleSave}>
            <div className="pf-card-heading">
              <div>
                <span className="pf-section-label">
                  YOUR INFORMATION
                </span>
                <h3>Edit Personal Details</h3>
                <p>Keep your contact details and introduction up to date.</p>
              </div>
            </div>

            <div className="pf-form-grid">
              <label className="pf-field">
                Full name
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                />
              </label>

              <label className="pf-field">
                Registered email
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                />
                <small>Your login email is managed by your account.</small>
              </label>

              <label className="pf-field">
                Phone number
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  maxLength={20}
                />
              </label>

              <label className="pf-field">
                City or location
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="e.g. Pune, India"
                  maxLength={100}
                />
              </label>

              <label className="pf-field pf-field-full">
                Professional headline
                <input
                  type="text"
                  name="headline"
                  value={profile.headline}
                  onChange={handleChange}
                  placeholder="e.g. Aspiring Full Stack Developer"
                  maxLength={150}
                />
              </label>

              <label className="pf-field pf-field-full">
                About me
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell employers about your interests, strengths and career goals..."
                  rows={5}
                  maxLength={700}
                />
                <small>{profile.bio.length}/700 characters</small>
              </label>
            </div>

            <div className="pf-form-actions">
              <button
                type="button"
                className="pf-outline-btn"
                onClick={() => {
                  setActiveTab("overview");
                  setMessage("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button type="submit" className="pf-primary-btn">
                Save Changes <span>✓</span>
              </button>
            </div>
          </form>
        )}

        {/* Career preferences form */}
        {activeTab === "career" && (
          <form className="pf-card pf-edit-card" onSubmit={handleSave}>
            <div className="pf-card-heading">
              <div>
                <span className="pf-section-label">
                  PLAN YOUR NEXT MOVE
                </span>
                <h3>Career Preferences</h3>
                <p>
                  Tell JobMate AI what type of role and work you prefer.
                </p>
              </div>
            </div>

            <div className="pf-form-grid">
              <label className="pf-field">
                Target job role
                <select
                  name="targetRole"
                  value={profile.targetRole}
                  onChange={handleChange}
                >
                  <option>Frontend Developer</option>
                  <option>Python Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>AI/ML Engineer</option>
                  <option>Software Developer</option>
                </select>
              </label>

              <label className="pf-field">
                Experience level
                <select
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                >
                  <option>Fresher</option>
                  <option>Less than 1 year</option>
                  <option>1–3 years</option>
                  <option>3–5 years</option>
                  <option>5+ years</option>
                </select>
              </label>

              <label className="pf-field">
                Preferred work style
                <select
                  name="employmentType"
                  value={profile.employmentType}
                  onChange={handleChange}
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                  <option>Any</option>
                </select>
              </label>

              <label className="pf-field">
                Preferred location
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="e.g. Pune or Remote"
                  maxLength={100}
                />
              </label>

              <label className="pf-field pf-field-full">
                Skills
                <textarea
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="Python, React, SQL, JavaScript"
                  rows={3}
                  maxLength={500}
                />
                <small>
                  Separate skills with commas. Example: Python, React, SQL.
                </small>
              </label>
            </div>

            <div className="pf-form-actions">
              <button
                type="button"
                className="pf-outline-btn"
                onClick={() => {
                  setActiveTab("overview");
                  setMessage("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button type="submit" className="pf-primary-btn">
                Save Preferences <span>✓</span>
              </button>
            </div>
          </form>
        )}

        {/* Bottom navigation cards */}
        <section className="pf-quick-links">
          <button type="button" onClick={() => navigate("/jobs")}>
            <span className="pf-quick-icon pink">▣</span>
            <span>
              <strong>Explore Jobs</strong>
              <small>Discover suitable opportunities</small>
            </span>
            <b>→</b>
          </button>

          <button type="button" onClick={() => navigate("/resume-analyzer")}>
            <span className="pf-quick-icon purple">▤</span>
            <span>
              <strong>Resume Analyzer</strong>
              <small>Review and improve your resume</small>
            </span>
            <b>→</b>
          </button>
        </section>

        <footer className="pf-footer">
          <span>✦ JobMate AI</span>
          <p>Your career journey, all in one place.</p>
        </footer>

      </div>
    </main>
  );
}

export default Profile;
