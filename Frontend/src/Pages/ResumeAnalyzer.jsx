import { useRef, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const roles = [
  { value: "frontend", label: "Frontend Developer" },
  { value: "python", label: "Python Developer" },
  { value: "data", label: "Data Analyst" },
];

function ResumeAnalyzer() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState("frontend");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentRole =
    roles.find((role) => role.value === targetRole)?.label ||
    roles[0].label;

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =====================================
  // VALIDATE UPLOADED RESUME
  // =====================================

  const validateFile = (file) => {
    setError("");
    setNotice("");
    setReport(null);

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["pdf", "docx"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);
      setError(
        "Unsupported file type. Please upload a PDF or DOCX resume."
      );
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setError(
        "This file is empty. Please select another resume."
      );
      return;
    }

    if (file.size > maxSize) {
      setSelectedFile(null);
      setError("Your resume must be smaller than 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files?.[0]);

    // Allows the same file to be selected again.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    validateFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setNotice("");
    setReport(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================
  // ANALYSE RESUME THROUGH FLASK
  // =====================================

  const handleAnalyze = async () => {
    setError("");
    setNotice("");
    setReport(null);

    if (!selectedFile) {
      setError(
        "Please upload your resume before continuing."
      );
      return;
    }

    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setError(
        "Please log in to your JobMate AI account before analysing your resume."
      );
      return;
    }

    if (isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();

      formData.append("resume", selectedFile);
      formData.append("target_role", targetRole);

      const response = await fetch(
        `${API_BASE_URL}/api/resume/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        throw new Error(
          data.message ||
            "Resume analysis failed. Please try again."
        );
      }

      // Accept either { report: {...} } or a direct report object.
      const result = data.report || data;

      const normalizedReport = {
  score: Number(result.score ?? 0),

  matched: Array.isArray(result.matched)
    ? result.matched
    : [],

  missing: Array.isArray(result.missing)
    ? result.missing
    : [],

  strengths: Array.isArray(result.strengths)
    ? result.strengths
    : [],

  improvements: Array.isArray(result.improvements)
    ? result.improvements
    : [],

  jobMatches: Array.isArray(result.job_matches)
    ? result.job_matches
    : [],
};
      if (
        !Number.isFinite(normalizedReport.score) ||
        normalizedReport.score < 0 ||
        normalizedReport.score > 100
      ) {
        throw new Error(
          "The backend returned an invalid analysis score."
        );
      }

      setReport(normalizedReport);
      setNotice(
        data.message || "Resume analysis completed successfully."
      );

      window.setTimeout(() => {
        document
          .getElementById("resume-analysis-report")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to Flask. Please check your backend."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // =====================================
  // PAGE UI
  // =====================================

  return (
    <main className="ra-page">
      <div className="ra-container">
        {/* Hero */}
        <header className="ra-hero">
          <div className="ra-hero-copy">
            <span className="ra-eyebrow">
              <span>✦</span> AI-POWERED RESUME STUDIO
            </span>

            <h1>
              Make your resume <span>stand out.</span>
            </h1>

            <p>
              Analyse your resume against your target role,
              discover relevant skills and get practical
              recommendations to improve your profile.
            </p>

            <div className="ra-trust-points">
              <span>
                <b>✓</b> PDF and DOCX
              </span>
              <span>
                <b>✓</b> Up to 5 MB
              </span>
              <span>
                <b>✓</b> Role-specific analysis
              </span>
            </div>
          </div>

          <div
            className="ra-hero-illustration"
            aria-hidden="true"
          >
            <div className="ra-orbit ra-orbit-one" />
            <div className="ra-orbit ra-orbit-two" />

            <div className="ra-document">
              <div className="ra-document-top">
                <span />
                <span />
                <span />
              </div>

              <div className="ra-document-avatar">CV</div>
              <div className="ra-document-line long" />
              <div className="ra-document-line medium" />
              <div className="ra-document-heading-line" />
              <div className="ra-document-line long" />
              <div className="ra-document-line short" />
              <div className="ra-document-heading-line" />
              <div className="ra-document-line medium" />

              <div className="ra-document-check">✓</div>
            </div>

            <div className="ra-floating-score">
              <span>✦</span>
              <div>
                <strong>Resume insights</strong>
                <small>Personalised analysis</small>
              </div>
            </div>
          </div>
        </header>

        {/* Upload section */}
        <section className="ra-main-grid">
          <div className="ra-card ra-upload-card">
            <div className="ra-section-heading">
              <div>
                <span className="ra-section-kicker">
                  STEP 01
                </span>

                <h2>Upload your resume</h2>

                <p>
                  Start with your latest resume document.
                </p>
              </div>

              <span className="ra-heading-icon">↥</span>
            </div>

            <div
              className={`ra-dropzone ${
                dragActive ? "drag-active" : ""
              } ${selectedFile ? "has-file" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <>
                  <div className="ra-upload-symbol">
                    <span>↑</span>
                  </div>

                  <h3>Drop your resume here</h3>

                  <p>
                    or select a file from your computer
                  </p>

                  <button
                    type="button"
                    className="ra-browse-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Browse Files
                  </button>

                  <span className="ra-file-note">
                    PDF or DOCX · Maximum 5 MB
                  </span>
                </>
              ) : (
                <div className="ra-selected-file">
                  <div className="ra-file-icon">
                    {selectedFile.name
                      .split(".")
                      .pop()
                      .toUpperCase()}
                  </div>

                  <div className="ra-file-info">
                    <strong>{selectedFile.name}</strong>

                    <span>
                      {formatFileSize(selectedFile.size)} · File selected
                    </span>

                    <span className="ra-file-ready">
                      <b>✓</b> Ready for analysis
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ra-remove-file"
                    onClick={removeFile}
                    aria-label="Remove selected resume"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              className="ra-hidden-input"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

            {error && (
              <div className="ra-error" role="alert">
                <span>!</span> {error}
              </div>
            )}

            <div className="ra-privacy-note">
              <span>ⓘ</span>

              <p>
                Your resume will be sent to the JobMate AI
                backend for processing. Only upload a document
                you are comfortable sharing with this application.
              </p>
            </div>
          </div>

          {/* Role and benefits */}
          <div className="ra-side-column">
            <section className="ra-card ra-role-card">
              <span className="ra-section-kicker">
                STEP 02
              </span>

              <h2>Choose your target role</h2>

              <p>
                Select the type of job you are preparing for.
              </p>

              <label
                className="ra-field-label"
                htmlFor="ra-target-role"
              >
                Target job role
              </label>

              <select
                id="ra-target-role"
                className="ra-role-select"
                value={targetRole}
                disabled={isAnalyzing}
                onChange={(event) => {
                  setTargetRole(event.target.value);
                  setReport(null);
                  setNotice("");
                  setError("");
                }}
              >
                {roles.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>

              <div className="ra-role-note">
                <span>✦</span>

                <p>
                  Your analysis will target{" "}
                  <strong>{currentRole}</strong>.
                </p>
              </div>
            </section>

            <section className="ra-insight-card">
              <div className="ra-insight-icon">✧</div>

              <div>
                <h3>What you'll explore</h3>

                <p>
                  Resume score, matching skills, skill gaps and
                  practical improvement suggestions.
                </p>
              </div>
            </section>

            <section className="ra-checklist-card">
              <h3>Your resume checklist</h3>

              <div>
                <span>✓</span> Clear contact information
              </div>

              <div>
                <span>✓</span> Relevant technical skills
              </div>

              <div>
                <span>✓</span> Project details and outcomes
              </div>

              <div>
                <span>✓</span> Easy-to-read formatting
              </div>
            </section>
          </div>
        </section>

        {/* Analyse action */}
        <section className="ra-analyze-bar">
          <div className="ra-analyze-copy">
            <div className="ra-analyze-sparkle">✦</div>

            <div>
              <h3>
                {isAnalyzing
                  ? "Analysing your resume..."
                  : "Ready to review your resume?"}
              </h3>

              <p>
                {isAnalyzing
                  ? "Please wait while the backend processes your file."
                  : selectedFile
                    ? `${selectedFile.name} is ready to analyse for ${currentRole}.`
                    : "Upload your resume and choose your target role to continue."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ra-analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing
              ? "Analysing..."
              : "Analyse Resume"}

            {!isAnalyzing && <span>→</span>}
          </button>
        </section>

        {/* Analysis report from backend */}
        {report && (
          <section
            id="resume-analysis-report"
            className="ra-report-section"
            aria-live="polite"
          >
            <div className="ra-report-heading">
              <div>
                <span className="ra-section-kicker">
                  YOUR RESUME REPORT
                </span>

                <h2>Resume analysis results</h2>

                <p>
                  {selectedFile?.name} · Target role: {currentRole}
                </p>
              </div>

              <span className="ra-demo-badge">
                ANALYSIS COMPLETE
              </span>
            </div>

            {notice && (
              <div className="ra-privacy-note">
                <span>✓</span>
                <p>{notice}</p>
              </div>
            )}

            <div className="ra-report-grid">
              <article className="ra-report-score-card">
                <span className="ra-report-card-label">
                  RESUME MATCH SCORE
                </span>

                <div className="ra-report-score-ring">
                  <div>
                    <strong>{report.score}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <h3>Target role alignment</h3>

                <p>
                  This score reflects the backend's assessment
                  of the resume against the selected role.
                </p>
              </article>

              <article className="ra-report-detail-card">
                <div className="ra-report-detail-heading">
                  <span className="ra-report-small-icon purple">
                    ✓
                  </span>

                  <div>
                    <h3>Relevant skills</h3>
                    <p>Skills identified in your resume</p>
                  </div>
                </div>

                <div className="ra-report-skill-list">
                  {report.matched.length > 0 ? (
                    report.matched.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))
                  ) : (
                    <p>
                      No matching skills were identified.
                    </p>
                  )}
                </div>

                <div className="ra-report-detail-heading ra-report-gap-heading">
                  <span className="ra-report-small-icon pink">
                    +
                  </span>

                  <div>
                    <h3>Skills to consider</h3>
                    <p>
                      Relevant skills not found in the resume text
                    </p>
                  </div>
                </div>

                <div className="ra-report-skill-list missing">
                  {report.missing.length > 0 ? (
                    report.missing.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))
                  ) : (
                    <p>
                      No additional skill gaps were identified.
                    </p>
                  )}
                </div>
              </article>
            </div>

            <div className="ra-report-grid ra-report-grid-bottom">
              <article className="ra-report-detail-card">
                <div className="ra-report-detail-heading">
                  <span className="ra-report-small-icon green">
                    ↗
                  </span>

                  <div>
                    <h3>Potential strengths</h3>
                    <p>What your resume shows</p>
                  </div>
                </div>

                <ul className="ra-report-list">
                  {report.strengths.length > 0 ? (
                    report.strengths.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))
                  ) : (
                    <li>
                      Add relevant skills and projects to strengthen
                      your resume.
                    </li>
                  )}
                </ul>
              </article>

              <article className="ra-report-detail-card">
                <div className="ra-report-detail-heading">
                  <span className="ra-report-small-icon orange">
                    ✦
                  </span>

                  <div>
                    <h3>Improvement ideas</h3>
                    <p>Practical suggestions for your next revision</p>
                  </div>
                </div>

                <ul className="ra-report-list">
                  {report.improvements.length > 0 ? (
                    report.improvements.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))
                  ) : (
                    <li>
                      Review the role requirements and add evidence
                      of your relevant experience.
                    </li>
                  )}
                </ul>
              </article>
            </div>

{/* RECOMMENDED JOBS */}
<section style={{ marginTop: "32px" }}>
  <div className="ra-report-heading">
    <div>
      <span className="ra-section-kicker">
        PERSONALIZED RECOMMENDATIONS
      </span>

      <h2>Jobs matched to your resume</h2>

      <p>
        These opportunities are ranked using detected skills
        and job-role information.
      </p>
    </div>

    <span className="ra-demo-badge">
      JOB MATCHES
    </span>
  </div>

  {report.jobMatches.length > 0 ? (
    <div className="ra-report-grid">
      {report.jobMatches.map((job) => (
        <article
          className="ra-report-detail-card"
          key={job.job_key}
        >
          <div className="ra-report-detail-heading">
            <span className="ra-report-small-icon purple">
              ↗
            </span>

            <div>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              margin: "18px 0",
            }}
          >
            <span className="ra-report-skill-list">
              <span>{job.match_score}% match</span>
            </span>

            <span>{job.location}</span>
            <span>{job.salary}</span>
          </div>

          <p>
            <strong>Employment type:</strong>{" "}
            {job.type}
          </p>

          <h3 style={{ marginTop: "18px" }}>
            Matching skills
          </h3>

          <div className="ra-report-skill-list">
            {Array.isArray(job.matched_skills) &&
            job.matched_skills.length > 0 ? (
              job.matched_skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))
            ) : (
              <span>No matching skills detected</span>
            )}
          </div>

          <button
            type="button"
            className="ra-analyze-btn"
            style={{ marginTop: "20px" }}
            onClick={() => {
              window.location.href = "/jobs";
            }}
          >
            Explore Jobs <span>→</span>
          </button>
        </article>
      ))}
    </div>
  ) : (
    <div className="ra-report-detail-card">
      <h3>No matching jobs available</h3>
      <p>
        There are currently no active job recommendations
        for this resume. Try again after active jobs are added.
      </p>
    </div>
  )}
</section>
            <div className="ra-demo-disclaimer">
              <span>ⓘ</span>

              This report is guidance, not a guarantee of hiring
              success. Review each suggestion and include only
              skills and experience you genuinely have.
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="ra-how-section">
          <div className="ra-how-heading">
            <span className="ra-section-kicker">
              A CLEARER CAREER PATH
            </span>

            <h2>How Resume Analyzer works</h2>

            <p>
              Turn your resume into practical insights for your
              next career step.
            </p>
          </div>

          <div className="ra-how-grid">
            <article className="ra-how-card">
              <span className="ra-how-number">01</span>

              <div className="ra-how-icon lavender">↥</div>

              <h3>Upload your resume</h3>

              <p>
                Select a supported document and choose your target role.
              </p>
            </article>

            <article className="ra-how-card">
              <span className="ra-how-number">02</span>

              <div className="ra-how-icon pink">✧</div>

              <h3>Analyse your profile</h3>

              <p>
                The backend extracts resume text and compares it
                with role-related skills.
              </p>
            </article>

            <article className="ra-how-card">
              <span className="ra-how-number">03</span>

              <div className="ra-how-icon blue">↗</div>

              <h3>Improve with insights</h3>

              <p>
                Review matched skills, possible gaps and
                suggestions for improvement.
              </p>
            </article>
          </div>
        </section>

        <footer className="ra-footer">
          <span>✦ JobMate AI</span>

          <p>
            Build a stronger resume. Take your next career step.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default ResumeAnalyzer;