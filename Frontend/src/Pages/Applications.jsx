
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const jobDetails = {
  "python-developer": {
    title: "Python Developer",
    company: "TechNova Solutions",
    location: "Pune, India",
    salary: "₹5–8 LPA",
    type: "Full Time",
    logo: "T",
    color: "violet",
  },
  "frontend-developer": {
    title: "Frontend Developer",
    company: "CreativeSoft",
    location: "Mumbai, India",
    salary: "₹4–7 LPA",
    type: "Full Time",
    logo: "C",
    color: "pink",
  },
  "data-analyst": {
    title: "Data Analyst",
    company: "DataVision",
    location: "Bengaluru, India",
    salary: "₹5–9 LPA",
    type: "Full Time",
    logo: "D",
    color: "blue",
  },
  "fullstack-developer": {
    title: "Junior Full Stack Developer",
    company: "CodeSphere",
    location: "Remote",
    salary: "₹4–8 LPA",
    type: "Remote",
    logo: "S",
    color: "green",
  },
};

const statusOptions = [
  "All Applications",
  "Applied",
  "In Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const nextStepByStatus = {
  Applied: "Your application has been submitted and recorded.",
  "In Review": "The employer is reviewing your application.",
  Shortlisted: "Review your relevant projects and technical skills.",
  Interview: "Prepare your technical and behavioural interview topics.",
  Offer: "Review the offer details and next steps with the employer.",
  Rejected: "Review the role requirements and continue your job search.",
  Withdrawn: "This application has been marked as withdrawn.",
};

function mapApiApplication(record, apiJobs = []) {
  const jobId = String(record.job_id || "");

  // Pehle database se job details search karo.
  const apiJob = apiJobs.find(
    (job) => String(job.job_key || job.id) === jobId
  );

  // Agar purani job hai, uski existing details use karo.
  const existingJob = jobDetails[jobId];

  // Agar job ID unknown hai, uska title readable banao.
  const readableTitle = jobId
    .split(/[-_]/)
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

  const companyName =
    apiJob?.company ||
    record.company ||
    existingJob?.company ||
    "Company not specified";

  const job = {
    ...(existingJob || {}),
    title:
      apiJob?.title ||
      record.title ||
      existingJob?.title ||
      readableTitle ||
      "Unknown Job",

    company: companyName,

    location:
      apiJob?.location ||
      record.location ||
      existingJob?.location ||
      "Location not specified",

    salary:
      apiJob?.salary ||
      record.salary ||
      existingJob?.salary ||
      "Not specified",

    type:
      apiJob?.type ||
      apiJob?.employment_type ||
      record.type ||
      existingJob?.type ||
      "Full Time",

    logo:
      existingJob?.logo ||
      companyName.charAt(0).toUpperCase(),

    color: existingJob?.color || "violet",
  };

  return {
    ...job,
    id: String(record.id),
    jobId,
    appliedOn: record.applied_at
      ? String(record.applied_at).slice(0, 10)
      : "",
    status: record.status,
    nextStep:
      nextStepByStatus[record.status] ||
      "Check the latest application details.",
  };
}
function Applications() {
  const [applications, setApplications] = useState([]);
  const [activeStatus, setActiveStatus] = useState("All Applications");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [withdrawConfirmApplication, setWithdrawConfirmApplication] =
  useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // =====================================
  // FETCH APPLICATIONS FROM FLASK / MYSQL
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    async function loadApplications() {
      if (!token) {
        setNotice("Please log in to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/applications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (!cancelled) {
            setNotice(
              response.status === 401
                ? "Your login session may have expired. Please log in again."
                : data.message || "Could not load applications."
            );
            setLoading(false);
          }
          return;
        }

        const records = Array.isArray(data.applications)
          ? data.applications
          : [];

        // Fetch job details from the database
let apiJobs = [];

try {
  const jobsResponse = await fetch(
    `${API_BASE_URL}/api/jobs`
  );

  if (jobsResponse.ok) {
    const jobsData = await jobsResponse.json();

    apiJobs = Array.isArray(jobsData.jobs)
      ? jobsData.jobs
      : [];
  }
} catch (error) {
  console.error("Could not load job details:", error);
}

// Map all applications, including new jobs
const mappedApplications = records.map((record) =>
  mapApiApplication(record, apiJobs)
);

        if (!cancelled) {
          setApplications(mappedApplications);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not connect to Flask. Please check that the backend is running."
          );
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================
  // APPLICATION STATUS COUNTS
  // =====================================

  const statusCounts = useMemo(() => {
    const counts = {
      "All Applications": applications.length,
    };

    for (const application of applications) {
      counts[application.status] =
        (counts[application.status] || 0) + 1;
    }

    return counts;
  }, [applications]);

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = applications.filter((application) => {
      const matchesStatus =
        activeStatus === "All Applications" ||
        application.status === activeStatus;

      const searchableText = [
        application.title,
        application.company,
        application.location,
        application.status,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "Newest First") {
        return b.appliedOn.localeCompare(a.appliedOn);
      }

      if (sortBy === "Oldest First") {
        return a.appliedOn.localeCompare(b.appliedOn);
      }

      return a.title.localeCompare(b.title);
    });

    return result;
  }, [applications, activeStatus, search, sortBy]);

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const getStatusClass = (status) =>
    status.toLowerCase().replace(/\s+/g, "-");

  // =====================================
  // WITHDRAW APPLICATION VIA FLASK
  // =====================================

  const withdrawApplication = async (application) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in to update your application.");
      return;
    }

    if (withdrawingId !== null) return;

    setWithdrawingId(application.id);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${encodeURIComponent(
          application.jobId
        )}/withdraw`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          data.message || "Could not withdraw this application."
        );
        return;
      }

      const updatedApplications = applications.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status: "Withdrawn",
              nextStep: nextStepByStatus.Withdrawn,
            }
          : item
      );

      setApplications(updatedApplications);
      setSelectedApplication(null);
      setNotice(data.message || "Application withdrawn successfully.");
    } catch {
      setNotice(
        "Could not connect to Flask. The application was not updated."
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <main className="ma-page">
      <div className="ma-container">
        {/* Page header */}
        <header className="ma-header">
          <div>
            <span className="ma-eyebrow">
              ✦ YOUR CAREER JOURNEY
            </span>

            <h1>
              My <span>Applications</span>
            </h1>

            <p>
              Stay organised, follow your progress and keep track of your
              job search in one place.
            </p>
          </div>

          <a href="/jobs" className="ma-primary-link">
            Find More Jobs <span>→</span>
          </a>
        </header>

        {/* Summary cards */}
        <section className="ma-stats-grid">
          <article className="ma-stat-card">
            <span className="ma-stat-icon purple">▤</span>
            <div>
              <p>Total Applications</p>
              <strong>{applications.length}</strong>
              <small>In your account</small>
            </div>
          </article>

          <article className="ma-stat-card">
            <span className="ma-stat-icon blue">◷</span>
            <div>
              <p>In Review</p>
              <strong>{statusCounts["In Review"] || 0}</strong>
              <small>Awaiting a response</small>
            </div>
          </article>

          <article className="ma-stat-card">
            <span className="ma-stat-icon pink">◎</span>
            <div>
              <p>Interviews</p>
              <strong>{statusCounts.Interview || 0}</strong>
              <small>Prepare for the next step</small>
            </div>
          </article>

          <article className="ma-stat-card">
            <span className="ma-stat-icon green">✦</span>
            <div>
              <p>Offers</p>
              <strong>{statusCounts.Offer || 0}</strong>
              <small>Opportunities received</small>
            </div>
          </article>
        </section>

        {/* Database tracker note */}
        <div className="ma-demo-note">
          <span>ⓘ</span>
          Your applications are loaded from your account database.
          Employer status updates are not connected to real employers.
        </div>

        {/* Tracker panel */}
        <section className="ma-tracker-panel">
          <div className="ma-tracker-heading">
            <div>
              <span className="ma-section-label">
                APPLICATION TRACKER
              </span>
              <h2>Track your progress</h2>
              <p>
                Review each opportunity and its current status.
              </p>
            </div>

            <label className="ma-sort">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Job Title</option>
              </select>
            </label>
          </div>

          {/* Status tabs */}
          <div className="ma-tabs">
            {statusOptions.map((status) => (
              <button
                type="button"
                key={status}
                className={activeStatus === status ? "active" : ""}
                onClick={() => setActiveStatus(status)}
              >
                {status}
                <span>{statusCounts[status] || 0}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <label className="ma-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search job title, company or location..."
              aria-label="Search applications"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          {notice && (
            <div className="ma-notice" role="status">
              <span>ⓘ</span> {notice}
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {/* Applications list */}
          {loading ? (
            <div className="ma-empty">
              <h3>Loading your applications...</h3>
              <p>Fetching your account history from the database.</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="ma-list">
              {filteredApplications.map((application) => (
                <article
                  className="ma-application-card"
                  key={application.id}
                >
                  <div
                    className={`ma-company-logo ${application.color}`}
                  >
                    {application.logo}
                  </div>

                  <div className="ma-application-info">
                    <div className="ma-title-row">
                      <h3>{application.title}</h3>

                      <span
                        className={`ma-status ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <p className="ma-company-name">
                      {application.company}
                    </p>

                    <div className="ma-meta">
                      <span>⌖ {application.location}</span>
                      <span>{application.salary}</span>
                      <span>▣ {application.type}</span>
                    </div>

                    <div className="ma-applied-date">
                      <span>◷</span>
                      Applied on {formatDate(application.appliedOn)}
                    </div>

                    <div className="ma-next-step">
                      <span>✦</span>
                      {application.nextStep}
                    </div>
                  </div>

                  <div className="ma-card-actions">
                    <button
                      type="button"
                      className="ma-view-btn"
                      onClick={() =>
                        setSelectedApplication(application)
                      }
                    >
                      View Details <span>→</span>
                    </button>

                    {application.status === "Applied" && (
                      <button
                        type="button"
                        className="ma-withdraw-btn"
                        disabled={withdrawingId !== null}
                        onClick={() =>
  setWithdrawConfirmApplication(application)
}
                      >
                        {withdrawingId === application.id
                          ? "Withdrawing..."
                          : "Withdraw Application"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="ma-empty">
              <div>▤</div>
              <h3>
                {search || activeStatus !== "All Applications"
                  ? "No applications found"
                  : "No applications yet"}
              </h3>
              <p>
                {search || activeStatus !== "All Applications"
                  ? "Try another status or search term."
                  : "Explore jobs and use Apply Now to record an application in your account."}
              </p>

              <button
                type="button"
                className="ma-view-btn"
                onClick={() => {
                  if (
                    search ||
                    activeStatus !== "All Applications"
                  ) {
                    setSearch("");
                    setActiveStatus("All Applications");
                  } else {
                    window.location.href = "/jobs";
                  }
                }}
              >
                {search || activeStatus !== "All Applications"
                  ? "Clear Filters"
                  : "Explore Jobs"}
              </button>
            </div>
          )}
        </section>

        {/* Job search prompt */}
        <section className="ma-bottom-banner">
          <div className="ma-banner-icon">✦</div>
          <div>
            <h3>
              Your next opportunity could be one search away.
            </h3>
            <p>
              Explore roles that align with your skills and career goals.
            </p>
          </div>
          <a href="/jobs" className="ma-banner-btn">
            Explore Jobs <span>→</span>
          </a>
        </section>

        <footer className="ma-footer">
          <span>✦ JobMate AI</span>
          <p>Every application is a step forward.</p>
        </footer>
      </div>

      {/* Application details modal */}
      {selectedApplication && (
        <div
          className="ma-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <section
            className="ma-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ma-modal-title"
          >
            <div className="ma-modal-top">
              <span className="ma-section-label">
                APPLICATION DETAILS
              </span>
              <button
                type="button"
                className="ma-modal-close"
                aria-label="Close details"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>

            <div
              className={`ma-company-logo ${selectedApplication.color}`}
            >
              {selectedApplication.logo}
            </div>

            <h2 id="ma-modal-title">
              {selectedApplication.title}
            </h2>
            <p className="ma-modal-company">
              {selectedApplication.company}
            </p>

            <div className="ma-modal-status-row">
              <span>Status</span>
              <strong
                className={`ma-status ${getStatusClass(
                  selectedApplication.status
                )}`}
              >
                {selectedApplication.status}
              </strong>
            </div>

            <div className="ma-modal-detail-grid">
              <div>
                <small>Location</small>
                <strong>{selectedApplication.location}</strong>
              </div>
              <div>
                <small>Salary</small>
                <strong>{selectedApplication.salary}</strong>
              </div>
              <div>
                <small>Employment type</small>
                <strong>{selectedApplication.type}</strong>
              </div>
              <div>
                <small>Applied on</small>
                <strong>
                  {formatDate(selectedApplication.appliedOn)}
                </strong>
              </div>
            </div>

            <div className="ma-modal-next-step">
              <span>✦ Next step</span>
              <p>{selectedApplication.nextStep}</p>
            </div>

            <p className="ma-modal-disclaimer">
              This tracker stores applications in your account.
              It does not contact employers or receive real interview,
              offer or rejection updates.
            </p>

            <button
              type="button"
              className="ma-view-btn ma-modal-done"
              onClick={() => setSelectedApplication(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
      {/* WITHDRAW CONFIRMATION POPUP */}
      {withdrawConfirmApplication && (
        <div
          className="ma-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setWithdrawConfirmApplication(null);
            }
          }}
        >
          <section
            className="ma-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ma-withdraw-title"
          >
            <div className="ma-modal-top">
              <span className="ma-section-label">
                CONFIRM WITHDRAWAL
              </span>

              <button
                type="button"
                className="ma-modal-close"
                onClick={() => setWithdrawConfirmApplication(null)}
              >
                ×
              </button>
            </div>

            <h2 id="ma-withdraw-title">
              Withdraw this application?
            </h2>

            <p className="ma-modal-company">
              {withdrawConfirmApplication.title}
            </p>

            <div className="ma-modal-next-step">
              <strong>⚠ Please read before continuing</strong>

              <ul>
                <li>Your application status will become Withdrawn.</li>
                <li>Your application record will remain in history.</li>
                <li>You cannot undo this action directly from this page.</li>
                <li>This will not notify or contact the real employer.</li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="ma-view-btn"
                disabled={withdrawingId !== null}
                onClick={() => setWithdrawConfirmApplication(null)}
              >
                Keep Application
              </button>

              <button
                type="button"
                className="ma-withdraw-btn"
                disabled={withdrawingId !== null}
                onClick={() =>
                  withdrawApplication(withdrawConfirmApplication)
                }
              >
                {withdrawingId === withdrawConfirmApplication.id
                  ? "Withdrawing..."
                  : "Yes, Withdraw"}
              </button>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}

export default Applications;
