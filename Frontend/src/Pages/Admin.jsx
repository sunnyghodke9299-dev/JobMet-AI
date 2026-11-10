import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const jobDetails = {
  "python-developer": {
    title: "Python Developer",
    company: "TechNova Solutions",
  },
  "frontend-developer": {
    title: "Frontend Developer",
    company: "PixelCraft Technologies",
  },
  "data-analyst": {
    title: "Data Analyst",
    company: "DataVision Analytics",
  },
  "fullstack-developer": {
    title: "Full Stack Developer",
    company: "CodeSphere Technologies",
  },
};

const sections = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "users", label: "Users", icon: "♙" },
  { id: "jobs", label: "Jobs", icon: "▣" },
  { id: "applications", label: "Applications", icon: "▤" },
  { id: "interviews", label: "Interview Records", icon: "◉" },
];

const applicationStatuses = [
  "Applied",
  "In Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const statusClass = (status) =>
  String(status || "").toLowerCase().replace(/\s+/g, "-");

const formatDate = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const mapUser = (user) => ({
  id: user.id,
  name: user.name || "Unnamed user",
  email: user.email || "",
  role: user.role === "admin" ? "Admin" : "User",
  joined: formatDate(user.created_at),
  is_active: Boolean(user.is_active),
  status: user.is_active ? "Active" : "Inactive",
});

const mapApplication = (record) => {
  const job = jobDetails[record.job_id] || {
    title: record.job_id || "Unknown job",
    company: "—",
  };

  return {
    id: String(record.id),
    candidate: record.candidate || "Unknown user",
    email: record.email || "",
    userId: record.user_id,
    jobId: record.job_id,
    job: job.title,
    company: job.company,
    date: formatDate(record.applied_at),
    status: record.status,
  };
};

const mapJob = (record) => ({
  id: record.id || record.job_key,
  job_key: record.job_key || record.id,
  title: record.title || "Untitled job",
  company: record.company || "—",
  location: record.location || "—",
  type: record.type || record.employment_type || "Full Time",
  salary: record.salary || "Not specified",
  description: record.description || "",
  status:
    record.status === "Inactive" || record.status === "Draft"
      ? "Inactive"
      : "Active",
});

const emptyJobForm = {
  title: "",
  company: "",
  location: "",
  type: "Full Time",
  salary: "",
  description: "",
};

function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviewAnalytics, setInterviewAnalytics] = useState({
  summary: {},
  monthly: [],
  roles: [],
});

const [loadingInterviewAnalytics, setLoadingInterviewAnalytics] =
  useState(true);

const [analyticsError, setAnalyticsError] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [interviewAttempts, setInterviewAttempts] = useState([]);
const [loadingInterviewAttempts, setLoadingInterviewAttempts] = useState(true);
const [interviewError, setInterviewError] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingJobKey, setUpdatingJobKey] = useState(null);
  const [savingJob, setSavingJob] = useState(false);
  const [editingJobKey, setEditingJobKey] = useState(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  const [showJobForm, setShowJobForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [jobForm, setJobForm] = useState(emptyJobForm);

  // LOAD USERS FROM MYSQL
  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    async function loadUsers() {
      if (!token) {
        setNotice("Please log in with your admin account.");
        setLoadingUsers(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/users`,
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
              data.message || "Could not load registered users."
            );
            setLoadingUsers(false);
          }
          return;
        }

        const records = Array.isArray(data.users)
          ? data.users.map(mapUser)
          : [];

        if (!cancelled) {
          setUsers(records);
          setLoadingUsers(false);
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not connect to Flask while loading users."
          );
          setLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD JOBS FROM MYSQL
  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    async function loadJobs() {
      if (!token) {
        if (!cancelled) {
          setNotice("Please log in with your admin account.");
          setLoadingJobs(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/jobs`,
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
              data.message || "Could not load jobs from MySQL."
            );
            setLoadingJobs(false);
          }
          return;
        }

        const records = Array.isArray(data.jobs)
          ? data.jobs.map(mapJob)
          : [];

        if (!cancelled) {
          setJobs(records);
          setLoadingJobs(false);
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not connect to Flask while loading jobs."
          );
          setLoadingJobs(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD APPLICATIONS FROM MYSQL
  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    async function loadApplications() {
      if (!token) {
        setNotice("Please log in with your admin account.");
        setLoadingApplications(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/applications`,
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
              data.message || "Could not load applications."
            );
            setLoadingApplications(false);
          }
          return;
        }

        const records = Array.isArray(data.applications)
          ? data.applications.map(mapApplication)
          : [];

        if (!cancelled) {
          setApplications(records);
          setLoadingApplications(false);
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not connect to Flask while loading applications."
          );
          setLoadingApplications(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);


  // ==========================================
// LOAD INTERVIEW ANALYTICS FROM MYSQL
// ==========================================

useEffect(() => {
  let cancelled = false;

  async function loadInterviewAnalytics() {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setAnalyticsError("Please log in with your admin account.");
      setLoadingInterviewAnalytics(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/interview-analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load interview analytics."
        );
      }

      if (!cancelled) {
        setInterviewAnalytics({
          summary: data.summary || {},
          monthly: Array.isArray(data.monthly) ? data.monthly : [],
          roles: Array.isArray(data.roles) ? data.roles : [],
        });

        setAnalyticsError("");
      }
    } catch (error) {
      if (!cancelled) {
        setAnalyticsError(
          error.message || "Unable to load interview analytics."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingInterviewAnalytics(false);
      }
    }
  }

  loadInterviewAnalytics();

  return () => {
    cancelled = true;
  };
}, []);
// ==========================================
// LOAD INTERVIEW RECORDS FROM MYSQL
// ==========================================

useEffect(() => {
  let cancelled = false;

  async function loadInterviewAttempts() {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      if (!cancelled) {
        setInterviewError("Please log in with your admin account.");
        setLoadingInterviewAttempts(false);
      }
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/interview-attempts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load interview records."
        );
      }

      if (!cancelled) {
        setInterviewAttempts(
          Array.isArray(data.attempts) ? data.attempts : []
        );
        setInterviewError("");
      }
    } catch (error) {
      if (!cancelled) {
        setInterviewError(
          error.message || "Could not load interview records."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingInterviewAttempts(false);
      }
    }
  }

  loadInterviewAttempts();

  return () => {
    cancelled = true;
  };
}, []);

  // OVERVIEW COUNTS
  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  const publishedJobs = jobs.filter(
    (job) => job.status === "Active"
  ).length;

  const pendingApplications = applications.filter(
    (app) =>
      app.status === "Applied" ||
      app.status === "In Review"
  ).length;

  const tabTitle = sections.find(
    (section) => section.id === activeTab
  )?.label;

  // SEARCH FILTERS
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) =>
      [user.name, user.email, user.role, user.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return jobs.filter((job) =>
      [
        job.title,
        job.company,
        job.location,
        job.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [jobs, search]);

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return applications.filter((app) =>
      [
        app.id,
        app.candidate,
        app.email,
        app.job,
        app.company,
        app.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [applications, search]);
  const filteredInterviewAttempts = useMemo(() => {
  const query = search.toLowerCase().trim();

  return interviewAttempts.filter((item) =>
    [
      item.candidate,
      item.email,
      item.target_role,
      item.question,
      item.answer,
      item.score,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}, [interviewAttempts, search]);

  // ACTIVATE / DEACTIVATE USER
  const toggleUserStatus = async (user) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in with your admin account.");
      return;
    }

    if (updatingUserId !== null) return;

    const nextActiveStatus = !user.is_active;

    setUpdatingUserId(user.id);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: nextActiveStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          data.message || "Could not update this user's status."
        );
        return;
      }

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_active: nextActiveStatus,
                status: nextActiveStatus
                  ? "Active"
                  : "Inactive",
              }
            : item
        )
      );

      setNotice(
        data.message || "User status updated successfully."
      );
    } catch {
      setNotice(
        "Could not connect to Flask. User status was not changed."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // UPDATE APPLICATION STATUS
  const updateApplicationStatus = async (
    applicationId,
    nextStatus
  ) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in with your admin account.");
      return;
    }

    if (updatingApplicationId !== null) return;

    const currentApplication = applications.find(
      (app) => app.id === String(applicationId)
    );

    if (!currentApplication) {
      setNotice("Application not found.");
      return;
    }

    if (currentApplication.status === nextStatus) return;

    setUpdatingApplicationId(String(applicationId));
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/applications/${encodeURIComponent(
          applicationId
        )}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          data.message || "Could not update application status."
        );
        return;
      }

      setApplications((previous) =>
        previous.map((app) =>
          app.id === String(applicationId)
            ? { ...app, status: nextStatus }
            : app
        )
      );

      setNotice(
        data.message || "Application status updated successfully."
      );
    } catch {
      setNotice(
        "Could not connect to Flask. Application status was not changed."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  // JOB FORM HELPERS
  const resetJobForm = () => {
    setJobForm(emptyJobForm);
    setEditingJobKey(null);
    setShowJobForm(false);
  };

  const openAddJobForm = () => {
    setJobForm(emptyJobForm);
    setEditingJobKey(null);
    setShowJobForm(true);
    setNotice("");
  };

  const openEditJobForm = (job) => {
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Full Time",
      salary: job.salary || "",
      description: job.description || "",
    });

    setEditingJobKey(job.job_key);
    setShowJobForm(true);
    setNotice("");
  };

  // ADD / EDIT JOB IN MYSQL
  const handleSaveJob = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in with your admin account.");
      return;
    }

    if (savingJob) return;

    const isEditing = Boolean(editingJobKey);

    const payload = {
      title: jobForm.title.trim(),
      company: jobForm.company.trim(),
      location: jobForm.location.trim(),
      type: jobForm.type,
      salary: jobForm.salary.trim(),
      description: jobForm.description.trim(),
    };

    setSavingJob(true);
    setNotice("");

    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/admin/jobs/${encodeURIComponent(
            editingJobKey
          )}`
        : `${API_BASE_URL}/api/admin/jobs`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          data.message ||
            `Could not ${isEditing ? "update" : "add"} this job.`
        );
        return;
      }

      if (isEditing) {
        setJobs((previous) =>
          previous.map((job) =>
            job.job_key === editingJobKey
              ? {
                  ...job,
                  title: payload.title,
                  company: payload.company,
                  location: payload.location,
                  type: payload.type,
                  salary: payload.salary,
                  description: payload.description,
                }
              : job
          )
        );

        setNotice(
          data.message || "Job updated successfully in MySQL."
        );
      } else if (data.job) {
        setJobs((previous) => [
          mapJob(data.job),
          ...previous,
        ]);

        setNotice(
          data.message || "Job added successfully to MySQL."
        );
      } else {
        setNotice(
          "Job saved successfully. Refresh the Jobs tab to view it."
        );
      }

      setJobForm(emptyJobForm);
      setEditingJobKey(null);
      setShowJobForm(false);
      setActiveTab("jobs");
      setSearch("");
    } catch {
      setNotice(
        "Could not connect to Flask. The job was not saved."
      );
    } finally {
      setSavingJob(false);
    }
  };

  // ACTIVATE / DEACTIVATE JOB IN MYSQL
  const toggleJobStatus = async (job) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in with your admin account.");
      return;
    }

    if (updatingJobKey !== null) return;

    const nextStatus =
      job.status === "Active" ? "Inactive" : "Active";

    setUpdatingJobKey(job.job_key);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${encodeURIComponent(
          job.job_key
        )}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          data.message || "Could not update the job status."
        );
        return;
      }

      setJobs((previous) =>
        previous.map((item) =>
          item.job_key === job.job_key
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setNotice(
        data.message || "Job status updated in MySQL."
      );
    } catch {
      setNotice(
        "Could not connect to Flask. Job status was not changed."
      );
    } finally {
      setUpdatingJobKey(null);
    }
  };

  const openSection = (sectionId) => {
    setActiveTab(sectionId);
    setSearch("");
    setNotice("");
  };

  return (
    <main className="ad-page">
      <div className="ad-layout">
        {/* Sidebar */}
        <aside className="ad-sidebar">
          <div className="ad-brand">
            <span className="ad-brand-mark">✦</span>
            <span>
              JobMate <strong>AI</strong>
            </span>
          </div>

          <div className="ad-admin-label">ADMIN WORKSPACE</div>

          <nav
            className="ad-side-nav"
            aria-label="Admin sections"
          >
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={
                  activeTab === section.id ? "active" : ""
                }
                onClick={() => openSection(section.id)}
              >
                <span className="ad-side-icon">
                  {section.icon}
                </span>
                <span>{section.label}</span>

                {activeTab === section.id && (
                  <span className="ad-nav-active-dot" />
                )}
              </button>
            ))}
          </nav>

          <div className="ad-sidebar-bottom">
            <div className="ad-security-icon">♙</div>
            <strong>Admin access</strong>
            <p>
              Manage registered users, job listings and
              application records.
            </p>
            <span className="ad-demo-label">
              LIVE DATABASE DATA
            </span>
          </div>
        </aside>

        {/* Main content */}
        <section className="ad-main">
          <header className="ad-topbar">
            <div>
              <span className="ad-breadcrumb">
                Admin / {tabTitle}
              </span>

              <h1>
                {activeTab === "overview"
                  ? "Platform Overview"
                  : `${tabTitle} Management`}
              </h1>
            </div>

            <div className="ad-admin-profile">
              <div className="ad-admin-avatar">A</div>
              <div>
                <strong>Administrator</strong>
                <span>Admin workspace</span>
              </div>
            </div>
          </header>

          <div className="ad-content">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <section className="ad-welcome-banner">
                  <div>
                    <span className="ad-eyebrow">
                      ✦ ADMIN CONTROL CENTRE
                    </span>

                    <h2>Manage your platform.</h2>

                    <p>
                      Review registered users, maintain job listings
                      and track application activity from one workspace.
                    </p>
                  </div>

                  <div
                    className="ad-banner-art"
                    aria-hidden="true"
                  >
                    <span>✦</span>
                    <i>✓</i>
                    <b>▦</b>
                  </div>
                </section>

                <section className="ad-stat-grid">
                  <article className="ad-stat-card">
                    <span className="ad-stat-icon purple">
                      ♙
                    </span>

                    <div>
                      <p>Total Users</p>

                      <strong>
                        {loadingUsers ? "…" : users.length}
                      </strong>

                      <small>
                        {loadingUsers
                          ? "Loading users..."
                          : `${activeUsers} active accounts`}
                      </small>
                    </div>
                  </article>

                  <article className="ad-stat-card">
                    <span className="ad-stat-icon pink">
                      ▣
                    </span>

                    <div>
                      <p>Active Jobs</p>

                      <strong>
                        {loadingJobs ? "…" : publishedJobs}
                      </strong>

                      <small>
                        {loadingJobs
                          ? "Loading job listings..."
                          : `${jobs.length - publishedJobs} inactive listings`}
                      </small>
                    </div>
                  </article>

                  <article className="ad-stat-card">
                    <span className="ad-stat-icon blue">
                      ▤
                    </span>

                    <div>
                      <p>Applications</p>

                      <strong>
                        {loadingApplications
                          ? "…"
                          : applications.length}
                      </strong>

                      <small>
                        {pendingApplications} awaiting review
                      </small>
                    </div>
                  </article>

                  <article className="ad-stat-card">
                    <span className="ad-stat-icon green">
                      ↗
                    </span>

                    <div>
                      <p>Shortlisted</p>

                      <strong>
                        {
                          applications.filter(
                            (app) =>
                              app.status === "Shortlisted"
                          ).length
                        }
                      </strong>

                      <small>
                        Database application records
                      </small>
                    </div>
                  </article>
                </section>

                {/* INTERVIEW ANALYTICS */}

<section
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
    marginTop: "22px",
    marginBottom: "22px",
  }}
>
  {/* Interview Summary */}

  <article className="ad-panel">
    <span className="ad-section-kicker">
      AI INTERVIEW STATISTICS
    </span>

    <h2>Interview Analytics</h2>

    <p style={{ color: "#888", fontSize: "13px" }}>
      Performance across all registered candidates.
    </p>

    {analyticsError && (
      <p style={{ color: "#e87979" }}>
        {analyticsError}
      </p>
    )}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "14px",
        marginTop: "22px",
      }}
    >
      {[
        {
          label: "Total Attempts",
          value: interviewAnalytics.summary.total_attempts,
          icon: "🎯",
        },
        {
          label: "Candidates",
          value: interviewAnalytics.summary.candidates,
          icon: "👥",
        },
        {
          label: "Average Score",
          value:
            interviewAnalytics.summary.average_score !== undefined
              ? `${interviewAnalytics.summary.average_score}/100`
              : "—",
          icon: "📊",
        },
        {
          label: "Highest Score",
          value:
            interviewAnalytics.summary.highest_score !== undefined
              ? `${interviewAnalytics.summary.highest_score}/100`
              : "—",
          icon: "🏆",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(150, 100, 220, 0.09)",
            border: "1px solid rgba(150, 100, 220, 0.16)",
          }}
        >
          <div style={{ fontSize: "22px" }}>
            {stat.icon}
          </div>

          <p style={{ fontSize: "13px", color: "#aaa" }}>
            {stat.label}
          </p>

          <h2 style={{ margin: 0, color: "#b993f5" }}>
            {loadingInterviewAnalytics ? "…" : stat.value ?? 0}
          </h2>
        </div>
      ))}
    </div>
  </article>

  {/* Role Wise Analytics */}

  <article className="ad-panel">
    <span className="ad-section-kicker">
      ROLE PERFORMANCE
    </span>

    <h2>Role-wise Interview Scores</h2>

    <p style={{ color: "#888", fontSize: "13px" }}>
      Average score by selected career role.
    </p>

    {loadingInterviewAnalytics ? (
      <p>Loading role statistics...</p>
    ) : interviewAnalytics.roles.length === 0 ? (
      <p style={{ color: "#aaa" }}>
        No interview attempts available yet.
      </p>
    ) : (
      interviewAnalytics.roles.map((role) => {
        const score = Math.max(
          0,
          Math.min(100, Number(role.average_score) || 0)
        );

        return (
          <div key={role.target_role} style={{ marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "9px",
              }}
            >
              <strong>{role.target_role}</strong>

              <span style={{ color: "#c4a2f4" }}>
                {score}/100
              </span>
            </div>

            <div
              style={{
                height: "9px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.09)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(90deg, #9333ea, #db70ca)",
                }}
              />
            </div>

            <small style={{ color: "#999" }}>
              {role.attempts} interview attempts
            </small>
          </div>
        );
      })
    )}
  </article>
</section>

{/* MONTHLY INTERVIEW ACTIVITY */}

<article className="ad-panel" style={{ marginBottom: "22px" }}>
  <span className="ad-section-kicker">
    PLATFORM ACTIVITY
  </span>

  <h2>Monthly Interview Activity</h2>

  <p style={{ color: "#888", fontSize: "13px" }}>
    Number of AI interview evaluations over the last six months.
  </p>

  {loadingInterviewAnalytics ? (
    <p>Loading monthly activity...</p>
  ) : interviewAnalytics.monthly.length === 0 ? (
    <p style={{ color: "#aaa" }}>
      No monthly interview activity available yet.
    </p>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "20px",
        height: "220px",
        overflowX: "auto",
        padding: "20px 10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {interviewAnalytics.monthly.map((month) => {
        const maxAttempts = Math.max(
          1,
          ...interviewAnalytics.monthly.map(
            (item) => Number(item.attempts) || 0
          )
        );

        const height =
          (Number(month.attempts) / maxAttempts) * 100;

        return (
          <div
            key={month.month}
            style={{
              flex: "1 0 55px",
              maxWidth: "100px",
              textAlign: "center",
            }}
          >
            <strong style={{ color: "#d8b4fe", fontSize: "13px" }}>
              {month.attempts}
            </strong>

            <div
              style={{
                height: "155px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                marginTop: "8px",
              }}
            >
              <div
                title={`${month.attempts} attempts`}
                style={{
                  width: "65%",
                  maxWidth: "55px",
                  minHeight: "5px",
                  height: `${Math.max(height, 3)}%`,
                  borderRadius: "8px 8px 0 0",
                  background:
                    "linear-gradient(180deg, #c084fc, #9333ea)",
                }}
              />
            </div>

            <small style={{ color: "#aaa", fontSize: "11px" }}>
              {month.month}
            </small>
          </div>
        );
      })}
    </div>
  )}
</article>

                <section className="ad-overview-grid">
                  <article className="ad-panel">
                    <div className="ad-panel-heading">
                      <div>
                        <span className="ad-section-kicker">
                          MANAGEMENT
                        </span>

                        <h2>Quick actions</h2>

                        <p>
                          Jump straight to a management task.
                        </p>
                      </div>
                    </div>

                    <div className="ad-quick-actions">
                      <button
                        type="button"
                        onClick={() => openSection("users")}
                      >
                        <span className="ad-quick-icon purple">
                          ♙
                        </span>

                        <span>
                          <strong>Manage users</strong>
                          <small>
                            Registered user accounts
                          </small>
                        </span>

                        <b>→</b>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openSection("jobs");
                          openAddJobForm();
                        }}
                      >
                        <span className="ad-quick-icon pink">
                          ＋
                        </span>

                        <span>
                          <strong>Add a job</strong>
                          <small>
                            Create a live job listing
                          </small>
                        </span>

                        <b>→</b>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openSection("applications")
                        }
                      >
                        <span className="ad-quick-icon blue">
                          ▤
                        </span>

                        <span>
                          <strong>Review applications</strong>
                          <small>
                            Update database statuses
                          </small>
                        </span>

                        <b>→</b>
                      </button>
                    </div>
                  </article>

                  <article className="ad-panel ad-health-panel">
                    <div className="ad-panel-heading">
                      <div>
                        <span className="ad-section-kicker">
                          PLATFORM SUMMARY
                        </span>

                        <h2>Workspace snapshot</h2>

                        <p>
                          Current user and application data.
                        </p>
                      </div>
                    </div>

                    <div className="ad-health-row">
                      <span>
                        <i className="ad-health-dot green" />
                        Active users
                      </span>

                      <strong>
                        {loadingUsers
                          ? "…"
                          : `${activeUsers} / ${users.length}`}
                      </strong>
                    </div>

                    <div className="ad-health-row">
                      <span>
                        <i className="ad-health-dot purple" />
                        Live job listings
                      </span>

                      <strong>
                        {loadingJobs
                          ? "…"
                          : `${publishedJobs} / ${jobs.length}`}
                      </strong>
                    </div>

                    <div className="ad-health-row">
                      <span>
                        <i className="ad-health-dot pink" />
                        Pending applications
                      </span>

                      <strong>{pendingApplications}</strong>
                    </div>

                    <div className="ad-demo-notice">
                      <span>ⓘ</span>
                      User accounts, job listings and applications
                      are managed through MySQL database records.
                    </div>
                  </article>
                </section>
              </>
            )}

            {/* MANAGEMENT TABS */}
            {activeTab !== "overview" && (
              <section className="ad-panel ad-management-panel">
                <div className="ad-management-heading">
                  <div>
                    <span className="ad-section-kicker">
                      PLATFORM MANAGEMENT
                    </span>

                    <h2>{tabTitle}</h2>

                    <p>
                      {activeTab === "users" &&
                        "View registered accounts and update account status."}

                      {activeTab === "jobs" &&
                        "Create, edit and activate job listings stored in MySQL."}

                      {activeTab === "applications" &&
                        "Review applications from MySQL and update their status."}
                    </p>
                  </div>

                  {activeTab === "jobs" && (
                    <button
                      type="button"
                      className="ad-primary-btn"
                      onClick={() => {
                        if (showJobForm) {
                          resetJobForm();
                        } else {
                          openAddJobForm();
                        }
                      }}
                    >
                      {showJobForm ? "Cancel" : "+ Add Job"}
                    </button>
                  )}
                </div>

                {/* ADD / EDIT JOB FORM */}
                {activeTab === "jobs" && showJobForm && (
                  <form
                    className="ad-job-form"
                    onSubmit={handleSaveJob}
                  >
                    <h3>
                      {editingJobKey
                        ? "Edit job listing"
                        : "Create a job listing"}
                    </h3>

                    <div className="ad-form-grid">
                      <label>
                        Job title
                        <input
                          required
                          maxLength={150}
                          value={jobForm.title}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              title: event.target.value,
                            })
                          }
                          placeholder="e.g. Backend Developer"
                        />
                      </label>

                      <label>
                        Company
                        <input
                          required
                          maxLength={150}
                          value={jobForm.company}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              company: event.target.value,
                            })
                          }
                          placeholder="Company name"
                        />
                      </label>

                      <label>
                        Location
                        <input
                          required
                          maxLength={150}
                          value={jobForm.location}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              location: event.target.value,
                            })
                          }
                          placeholder="e.g. Pune or Remote"
                        />
                      </label>

                      <label>
                        Salary range
                        <input
                          required
                          maxLength={60}
                          value={jobForm.salary}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              salary: event.target.value,
                            })
                          }
                          placeholder="e.g. ₹5–8 LPA"
                        />
                      </label>

                      <label>
                        Employment type
                        <select
                          value={jobForm.type}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              type: event.target.value,
                            })
                          }
                        >
                          <option>Full Time</option>
                          <option>Part Time</option>
                          <option>Contract</option>
                          <option>Remote</option>
                        </select>
                      </label>

                      <label className="ad-form-wide">
                        Job description (optional)
                        <textarea
                          rows={3}
                          maxLength={5000}
                          value={jobForm.description}
                          onChange={(event) =>
                            setJobForm({
                              ...jobForm,
                              description: event.target.value,
                            })
                          }
                          placeholder="Responsibilities, skills and requirements"
                        />
                      </label>
                    </div>

                    <button
                      className="ad-primary-btn"
                      type="submit"
                      disabled={savingJob}
                    >
                      {savingJob
                        ? "Saving..."
                        : editingJobKey
                          ? "Save Changes →"
                          : "Add Job →"}
                    </button>
                  </form>
                )}

                {/* SEARCH */}
                <label className="ad-search">
                  <span>⌕</span>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder={`Search ${activeTab}...`}
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
                  <div className="ad-notice" role="status">
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

                {/* USERS TABLE */}
                {activeTab === "users" && (
                  <div className="ad-table-wrap">
                    {loadingUsers ? (
                      <div className="ad-empty">
                        Loading registered users from MySQL...
                      </div>
                    ) : (
                      <>
                        <table className="ad-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Role</th>
                              <th>Joined</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user.id}>
                                <td>
                                  <div className="ad-table-person">
                                    <span>
                                      {user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>

                                    <div>
                                      <strong>{user.name}</strong>
                                      <small>{user.email}</small>
                                    </div>
                                  </div>
                                </td>

                                <td>{user.role}</td>
                                <td>{user.joined}</td>

                                <td>
                                  <span
                                    className={`ad-status ${statusClass(
                                      user.status
                                    )}`}
                                  >
                                    {user.status}
                                  </span>
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="ad-row-action"
                                    disabled={
                                      updatingUserId !== null
                                    }
                                    onClick={() =>
                                      toggleUserStatus(user)
                                    }
                                  >
                                    {updatingUserId === user.id
                                      ? "Updating..."
                                      : user.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                          <div className="ad-empty">
                            No registered users match your search.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* JOBS TABLE FROM MYSQL */}
                {activeTab === "jobs" && (
                  <div className="ad-table-wrap">
                    {loadingJobs ? (
                      <div className="ad-empty">
                        Loading job listings from MySQL...
                      </div>
                    ) : (
                      <>
                        <table className="ad-table">
                          <thead>
                            <tr>
                              <th>Job</th>
                              <th>Location</th>
                              <th>Salary</th>
                              <th>Applicants</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredJobs.map((job) => (
                              <tr key={job.job_key}>
                                <td>
                                  <div className="ad-table-person">
                                    <span>▣</span>

                                    <div>
                                      <strong>{job.title}</strong>
                                      <small>
                                        {job.company} · {job.type}
                                      </small>
                                    </div>
                                  </div>
                                </td>

                                <td>{job.location}</td>
                                <td>{job.salary}</td>

                                <td>
                                  {
                                    applications.filter(
                                      (app) =>
                                        app.jobId === job.job_key
                                    ).length
                                  }
                                </td>

                                <td>
                                  <span
                                    className={`ad-status ${statusClass(
                                      job.status
                                    )}`}
                                  >
                                    {job.status}
                                  </span>
                                </td>

                                <td>
                                  <div className="ad-job-actions">
                                    <button
                                      type="button"
                                      className="ad-row-action"
                                      onClick={() =>
                                        openEditJobForm(job)
                                      }
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      className="ad-row-action"
                                      disabled={
                                        updatingJobKey !== null
                                      }
                                      onClick={() =>
                                        toggleJobStatus(job)
                                      }
                                    >
                                      {updatingJobKey === job.job_key
                                        ? "Updating..."
                                        : job.status === "Active"
                                          ? "Deactivate"
                                          : "Activate"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {filteredJobs.length === 0 && (
                          <div className="ad-empty">
                            {jobs.length === 0
                              ? "No jobs found in MySQL. Use Add Job to create the first listing."
                              : "No matching job listings found."}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                
{/* INTERVIEW RECORDS TABLE */}

{activeTab === "interviews" && (
  <div className="ad-table-wrap">

    {interviewError && (
      <div className="ad-notice" role="alert">
        {interviewError}
      </div>
    )}

    {loadingInterviewAttempts ? (
      <div className="ad-empty">
        Loading interview records from MySQL...
      </div>
    ) : (
      <>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Interview Role</th>
              <th>Score</th>
              <th>Date</th>
              <th>Interview Details</th>
            </tr>
          </thead>

          <tbody>
            {filteredInterviewAttempts.map((attempt) => {
              const evaluation = attempt.evaluation || {};

              return (
                <tr key={attempt.id}>
                  <td>
                    <div className="ad-table-person">
                      <span>
                        {(attempt.candidate || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <div>
                        <strong>{attempt.candidate}</strong>
                        <small>{attempt.email}</small>
                        <small>Attempt #{attempt.id}</small>
                      </div>
                    </div>
                  </td>

                  <td>{attempt.target_role}</td>

                  <td>
                    <strong
                      style={{
                        color:
                          Number(attempt.score) >= 80
                            ? "#16a34a"
                            : Number(attempt.score) >= 60
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {attempt.score}/100
                    </strong>
                  </td>

                  <td>{formatDate(attempt.created_at)}</td>

                  <td>
                    <details>
                      <summary
                        style={{
                          cursor: "pointer",
                          color: "#9333ea",
                          fontWeight: "600",
                        }}
                      >
                        View Report
                      </summary>

                      <div
                        style={{
                          minWidth: "230px",
                          maxWidth: "380px",
                          padding: "12px",
                          whiteSpace: "normal",
                          lineHeight: 1.6,
                        }}
                      >
                        <h4>Question</h4>
                        <p>{attempt.question}</p>

                        <h4>Candidate Answer</h4>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {attempt.answer}
                        </p>

                        <h4>AI Feedback</h4>
                        <p>{evaluation.message || "Not available"}</p>

                        <h4>Strengths</h4>
                        {Array.isArray(evaluation.strengths) &&
                        evaluation.strengths.length > 0 ? (
                          evaluation.strengths.map((item, index) => (
                            <p key={index}>✓ {item}</p>
                          ))
                        ) : (
                          <p>Not available</p>
                        )}

                        <h4>Areas to Improve</h4>
                        {Array.isArray(evaluation.improvements) &&
                        evaluation.improvements.length > 0 ? (
                          evaluation.improvements.map((item, index) => (
                            <p key={index}>• {item}</p>
                          ))
                        ) : (
                          <p>Not available</p>
                        )}

                        <details style={{ marginTop: "12px" }}>
                          <summary style={{ cursor: "pointer" }}>
                            View Sample Answer
                          </summary>
                          <p>{evaluation.sample_answer || "Not available"}</p>
                        </details>
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInterviewAttempts.length === 0 && (
          <div className="ad-empty">
            {interviewAttempts.length === 0
              ? "No interview records found yet."
              : "No matching interview records found."}
          </div>
        )}
      </>
    )}
  </div>
)}


                {/* APPLICATIONS TABLE */}
                {activeTab === "applications" && (
                  <div className="ad-table-wrap">
                    {loadingApplications ? (
                      <div className="ad-empty">
                        Loading applications from MySQL...
                      </div>
                    ) : (
                      <>
                        <table className="ad-table">
                          <thead>
                            <tr>
                              <th>Candidate</th>
                              <th>Job</th>
                              <th>Applied on</th>
                              <th>Update status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredApplications.map((app) => (
                              <tr key={app.id}>
                                <td>
                                  <div className="ad-table-person">
                                    <span>
                                      {app.candidate
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>

                                    <div>
                                      <strong>
                                        {app.candidate}
                                      </strong>
                                      <small>{app.email}</small>
                                      <small>APP-{app.id}</small>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  <div>
                                    <strong>{app.job}</strong>
                                    <small className="ad-company-small">
                                      {app.company}
                                    </small>
                                  </div>
                                </td>

                                <td>{app.date}</td>

                                <td>
                                  <select
                                    className="ad-status-select"
                                    value={app.status}
                                    disabled={
                                      updatingApplicationId !== null
                                    }
                                    onChange={(event) =>
                                      updateApplicationStatus(
                                        app.id,
                                        event.target.value
                                      )
                                    }
                                    aria-label={`Status for ${app.candidate}`}
                                  >
                                    {applicationStatuses.map(
                                      (status) => (
                                        <option
                                          key={status}
                                          value={status}
                                        >
                                          {status}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {filteredApplications.length === 0 && (
                          <div className="ad-empty">
                            {applications.length === 0
                              ? "No applications found in the database yet."
                              : "No matching applications found."}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          <footer className="ad-footer">
            <span>✦ JobMate AI Admin</span>
            <p>
              User accounts, job listings and applications: MySQL database
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Admin;