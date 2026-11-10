import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const jobMetadata = {
  "python-developer": {
    skills: ["Python", "SQL", "Django"],
    match: 94,
    experience: "0–2 years",
    color: "violet",
    responsibilities: [
      "Develop and maintain Python applications.",
      "Work with SQL databases and REST APIs.",
      "Write clean, tested and maintainable code.",
      "Collaborate with the development team.",
    ],
    requirements: [
      "Fundamentals of Python programming.",
      "Basic knowledge of SQL and databases.",
      "Problem-solving and debugging skills.",
    ],
  },

  "frontend-developer": {
    skills: ["React.js", "JavaScript", "HTML", "CSS"],
    match: 89,
    experience: "0–2 years",
    color: "pink",
    responsibilities: [
      "Build reusable React components.",
      "Create responsive pages for desktop and mobile.",
      "Connect frontend interfaces with APIs.",
      "Debug and improve application performance.",
    ],
    requirements: [
      "Knowledge of HTML, CSS and JavaScript.",
      "Basic understanding of React.",
      "Understanding of responsive web design.",
    ],
  },

  "data-analyst": {
    skills: ["Python", "SQL", "Pandas", "Excel"],
    match: 86,
    experience: "0–2 years",
    color: "blue",
    responsibilities: [
      "Clean and analyse datasets.",
      "Write SQL queries and prepare reports.",
      "Identify trends in business data.",
      "Communicate findings to stakeholders.",
    ],
    requirements: [
      "Basic Python and SQL skills.",
      "Familiarity with Excel or spreadsheets.",
      "Interest in statistics and data visualisation.",
    ],
  },

  "fullstack-developer": {
    skills: ["React", "Python", "MySQL"],
    match: 82,
    experience: "0–2 years",
    color: "green",
    responsibilities: [
      "Create and maintain React interfaces.",
      "Build or integrate Python APIs.",
      "Work with relational databases.",
      "Test features and resolve bugs.",
    ],
    requirements: [
      "Fundamentals of JavaScript and React.",
      "Basic knowledge of Python.",
      "Understanding of SQL and REST APIs.",
    ],
  },
};

const colors = ["violet", "pink", "blue", "green"];

const parseSalary = (salary) => {
  const match = String(salary || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const getPostedDays = (createdAt) => {
  if (!createdAt) return 0;

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return 0;

  const difference = Date.now() - date.getTime();

  return Math.max(0, Math.floor(difference / 86400000));
};

const mapApiJob = (record, index) => {
  const id = String(record.job_key || record.id);
  const metadata = jobMetadata[id] || {};
  const company = record.company || "Company";
  const title = record.title || "Untitled Job";
  const location = record.location || "Location not specified";
  const type =
    record.type || record.employment_type || "Full Time";

  return {
    ...metadata,

    id,
    job_key: id,
    title,
    company,
    location,
    type,
    salary: record.salary || "Not specified",
    status: record.status || "Active",
    description:
      record.description ||
      "Explore this opportunity and review the requirements for the role.",

    skills: metadata.skills || [],
    match: metadata.match ?? 75,
    experience: metadata.experience || "Not specified",
    postedDays: getPostedDays(record.created_at),
    logo: company.charAt(0).toUpperCase(),
    color: metadata.color || colors[index % colors.length],
    responsibilities: metadata.responsibilities || [],
    requirements: metadata.requirements || [],
    minSalary: parseSalary(record.salary),
    created_at: record.created_at || null,
  };
};

const statusClass = (status) =>
  String(status || "").toLowerCase().replace(/\s+/g, "-");

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [employment, setEmployment] = useState("All Types");
  const [sortBy, setSortBy] = useState("Best Match");

  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [notice, setNotice] = useState("");

  const [savingJobId, setSavingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // =====================================
  // LOAD ACTIVE JOBS FROM MYSQL API
  // =====================================

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoadingJobs(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load job listings."
          );
        }

        const records = Array.isArray(data.jobs)
          ? data.jobs
          : [];

        const mappedJobs = records.map(mapApiJob);

        if (!cancelled) {
          setJobs(mappedJobs);
          setLoadingJobs(false);
        }
      } catch (error) {
        if (!cancelled) {
          setJobs([]);
          setLoadingJobs(false);
          setNotice(
            error.message ||
              "Could not connect to Flask. Please check the backend."
          );
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================
  // LOAD SAVED JOBS FROM MYSQL
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    if (!token) {
      setSavedJobs([]);
      return;
    }

    async function loadSavedJobs() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/saved-jobs`,
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
                ? "Please log in again to view your saved jobs."
                : data.message || "Could not load saved jobs."
            );
          }
          return;
        }

        const ids = Array.isArray(data.saved_jobs)
          ? data.saved_jobs.map((job) => String(job.job_id))
          : [];

        if (!cancelled) {
          setSavedJobs(ids);
          localStorage.setItem(
            "jobmate_saved_jobs",
            JSON.stringify(ids)
          );
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not connect to Flask while loading saved jobs."
          );
        }
      }
    }

    loadSavedJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================
  // LOAD APPLICATIONS FROM MYSQL
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    if (!token) {
      setAppliedJobs([]);
      return;
    }

    async function loadApplications() {
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
                ? "Please log in again to view your applications."
                : data.message || "Could not load applications."
            );
          }
          return;
        }

        const ids = Array.isArray(data.applications)
          ? data.applications.map((application) =>
              String(application.job_id)
            )
          : [];

        if (!cancelled) {
          setAppliedJobs(ids);
        }
      } catch {
        if (!cancelled) {
          setNotice(
            "Could not load applications. Please check Flask."
          );
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================
  // DYNAMIC FILTER OPTIONS
  // =====================================

  const availableLocations = useMemo(() => {
    const values = jobs.map((job) => {
      const isRemote =
        job.type.toLowerCase() === "remote" ||
        job.location.toLowerCase().includes("remote");

      if (isRemote) return "Remote";

      return job.location.split(",")[0].trim();
    });

    return [...new Set(values)].filter(Boolean).sort();
  }, [jobs]);

  const availableTypes = useMemo(() => {
    const values = jobs.map((job) => job.type).filter(Boolean);

    return [...new Set(values)].sort();
  }, [jobs]);

  // =====================================
  // SEARCH, FILTER AND SORT
  // =====================================

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.type,
        job.salary,
        job.description,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesLocation =
        location === "All Locations" ||
        (location === "Remote"
          ? job.type.toLowerCase() === "remote" ||
            job.location.toLowerCase().includes("remote")
          : job.location
              .toLowerCase()
              .startsWith(location.toLowerCase()));

      const matchesEmployment =
        employment === "All Types" ||
        job.type === employment;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesEmployment
      );
    });

    if (sortBy === "Best Match") {
      results.sort((a, b) => b.match - a.match);
    } else if (sortBy === "Newest") {
      results.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    } else if (sortBy === "Salary: High to Low") {
      results.sort((a, b) => b.minSalary - a.minSalary);
    }

    return results;
  }, [jobs, search, location, employment, sortBy]);

  // =====================================
  // SAVE OR REMOVE JOB
  // =====================================

  const toggleSaved = async (jobId) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in to save jobs to your account.");
      return;
    }

    if (savingJobId !== null) return;

    const id = String(jobId);
    const alreadySaved = savedJobs.includes(id);

    setSavingJobId(id);
    setNotice("");

    try {
      const response = await fetch(
        alreadySaved
          ? `${API_BASE_URL}/api/saved-jobs/${encodeURIComponent(id)}`
          : `${API_BASE_URL}/api/saved-jobs`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(alreadySaved
              ? {}
              : {
                  "Content-Type": "application/json",
                }),
          },
          ...(alreadySaved
            ? {}
            : {
                body: JSON.stringify({
                  job_id: id,
                }),
              }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          response.status === 401
            ? "Your session may have expired. Please log in again."
            : data.message || "Could not update saved jobs."
        );
        return;
      }

      const updated = alreadySaved
        ? savedJobs.filter((savedId) => savedId !== id)
        : savedJobs.includes(id)
          ? savedJobs
          : [...savedJobs, id];

      setSavedJobs(updated);

      localStorage.setItem(
        "jobmate_saved_jobs",
        JSON.stringify(updated)
      );

      setNotice(
        data.message ||
          (alreadySaved
            ? "Job removed from saved jobs."
            : "Job saved successfully!")
      );
    } catch {
      setNotice(
        "Could not connect to Flask. Please check the backend."
      );
    } finally {
      setSavingJobId(null);
    }
  };

  // =====================================
  // APPLY FOR A JOB USING MYSQL API
  // =====================================

  const applyForJob = async (job) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setNotice("Please log in to apply for a job.");
      return;
    }

    const jobId = String(job.id);

    if (appliedJobs.includes(jobId)) {
      setNotice("You have already applied for this job.");
      return;
    }

    if (applyingJobId !== null) return;

    setApplyingJobId(jobId);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: jobId,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setAppliedJobs((current) =>
          current.includes(jobId)
            ? current
            : [...current, jobId]
        );

        setNotice(
          data.message || "You have already applied for this job."
        );
        return;
      }

      if (!response.ok) {
        setNotice(
          response.status === 401
            ? "Your session may have expired. Please log in again."
            : data.message || "Could not save your application."
        );
        return;
      }

      setAppliedJobs((current) =>
        current.includes(jobId)
          ? current
          : [...current, jobId]
      );

      setNotice(
        data.message || `Application saved for ${job.title}.`
      );
    } catch {
      setNotice(
        "Could not connect to Flask. Your application was not saved."
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  // =====================================
  // RESET FILTERS
  // =====================================

  const resetFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setEmployment("All Types");
    setSortBy("Best Match");
    setNotice("");
  };

  return (
    <main className="jm-jobs-page">
      <div className="jm-jobs-container">
        {/* Page heading */}
        <header className="jm-jobs-hero">
          <span className="jm-jobs-eyebrow">
            <span>✦</span> AI-POWERED JOB DISCOVERY
          </span>

          <h1>
            Find your <span>dream job.</span>
          </h1>

          <p>
            Discover career opportunities, explore job requirements
            and find roles that align with your skills.
          </p>

          <div className="jm-jobs-highlights">
            <span><b>✦</b> Skill-based discovery</span>
            <span><b>✓</b> Explore job requirements</span>
            <span><b>♡</b> Save your favourites</span>
          </div>
        </header>

        {/* Search and filters */}
        <form
          className="jm-job-search"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(
              `${filteredJobs.length} matching job${
                filteredJobs.length === 1 ? "" : "s"
              } found.`
            );
          }}
        >
          <label className="jm-job-search-field">
            <span className="jm-search-icon">⌕</span>

            <span className="jm-search-input-wrap">
              <strong>What are you looking for?</strong>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Job title, company or skill"
                aria-label="Search jobs, companies or skills"
              />
            </span>
          </label>

          <span className="jm-search-separator" />

          <label className="jm-job-location-field">
            <span className="jm-search-icon">⌖</span>

            <span className="jm-search-input-wrap">
              <strong>Location</strong>

              <select
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                aria-label="Filter by location"
              >
                <option>All Locations</option>

                {availableLocations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <button className="jm-jobs-search-btn" type="submit">
            Search Jobs <span>→</span>
          </button>
        </form>

        {/* Results heading */}
        <section className="jm-jobs-results-heading">
          <div>
            <span className="jm-jobs-section-label">
              YOUR NEXT OPPORTUNITY
            </span>

            <h2>Explore opportunities</h2>

            <p>
              {loadingJobs
                ? "Loading live job listings..."
                : `${filteredJobs.length} job${
                    filteredJobs.length === 1 ? "" : "s"
                  } matching your filters`}
            </p>
          </div>

          <label className="jm-jobs-sort">
            Sort by

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option>Best Match</option>
              <option>Newest</option>
              <option>Salary: High to Low</option>
            </select>
          </label>
        </section>

        {/* Employment filters */}
        <section className="jm-jobs-filter-row">
          <div className="jm-job-type-filters">
            {["All Types", ...availableTypes].map((type) => (
              <button
                type="button"
                key={type}
                className={`jm-job-filter-chip ${
                  employment === type ? "selected" : ""
                }`}
                onClick={() => setEmployment(type)}
              >
                {type === "Remote" ? "⌂ " : ""}
                {type}
              </button>
            ))}
          </div>

          <span className="jm-jobs-demo-note">
            ✦ Live listings from JobMate AI
          </span>
        </section>

        {notice && (
          <div className="jm-jobs-notice" role="status">
            <span>✓</span> {notice}

            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Job listings */}
        {loadingJobs ? (
          <section className="jm-jobs-empty">
            <div>✦</div>
            <h3>Loading opportunities...</h3>
            <p>Getting the latest jobs from the database.</p>
          </section>
        ) : filteredJobs.length > 0 ? (
          <section className="jm-jobs-list">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const isApplied = appliedJobs.includes(job.id);
              const isSaving = savingJobId === job.id;
              const isApplying = applyingJobId === job.id;

              return (
                <article className="jm-job-card" key={job.id}>
                  <div className="jm-job-card-top">
                    <div
                      className={`jm-job-company-logo ${job.color}`}
                    >
                      {job.logo}
                    </div>

                    <div className="jm-job-heading">
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>

                      <span className="jm-job-location">
                        <span>⌖</span> {job.location}
                      </span>
                    </div>

                    <div className="jm-job-card-actions">
                      <button
                        type="button"
                        className={`jm-job-save-btn ${
                          isSaved ? "saved" : ""
                        }`}
                        aria-label={
                          isSaved ? "Unsave job" : "Save job"
                        }
                        title={
                          isSaved ? "Remove saved job" : "Save job"
                        }
                        disabled={savingJobId !== null}
                        onClick={() => toggleSaved(job.id)}
                      >
                        {isSaving
                          ? "…"
                          : isSaved
                            ? "♥"
                            : "♡"}
                      </button>

                      <div className="jm-job-match">
                        <strong>{job.match}%</strong>
                        <span>Profile match</span>
                      </div>
                    </div>
                  </div>

                  <div className="jm-job-facts">
                    <span>{job.salary}</span>
                    <span>▣ {job.type}</span>

                    {job.experience !== "Not specified" && (
                      <span>◷ {job.experience}</span>
                    )}

                    <span>
                      {job.postedDays === 0
                        ? "Posted today"
                        : `Posted ${job.postedDays} day${
                            job.postedDays === 1 ? "" : "s"
                          } ago`}
                    </span>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="jm-job-skills">
                      {job.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className="jm-job-card-footer">
                    <p>
                      <span>✦</span> Compare your skills with the
                      role requirements.
                    </p>

                    <div className="jm-job-footer-actions">
                      {isApplied && (
                        <span className="jm-job-applied-badge">
                          ✓ Applied
                        </span>
                      )}

                      <button
                        type="button"
                        className="jm-job-view-btn"
                        onClick={() => {
                          setSelectedJob(job);
                          setNotice("");
                        }}
                      >
                        View Details <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="jm-jobs-empty">
            <div>⌕</div>

            <h3>
              {jobs.length === 0
                ? "No active jobs available"
                : "No matching jobs found"}
            </h3>

            <p>
              {jobs.length === 0
                ? "Active job listings will appear here when they are added to JobMate AI."
                : "Try another keyword or adjust the location and job type."}
            </p>

            <button
              type="button"
              className="jm-jobs-search-btn"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          </section>
        )}

        {/* Saved jobs summary */}
        <section className="jm-jobs-bottom-info">
          <div className="jm-jobs-info-icon">♡</div>

          <div>
            <h3>Your career shortlist</h3>

            <p>
              You have saved {savedJobs.length} job
              {savedJobs.length === 1 ? "" : "s"} and recorded{" "}
              {appliedJobs.length} application
              {appliedJobs.length === 1 ? "" : "s"} in your account.
            </p>
          </div>
        </section>
      </div>

      {/* Job details modal */}
      {selectedJob && (
        <div
          className="jm-job-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedJob(null);
            }
          }}
        >
          <section
            className="jm-job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jm-job-modal-title"
          >
            <div className="jm-job-modal-top">
              <div
                className={`jm-job-company-logo ${selectedJob.color}`}
              >
                {selectedJob.logo}
              </div>

              <button
                type="button"
                className="jm-job-modal-close"
                aria-label="Close job details"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
            </div>

            <h2 id="jm-job-modal-title">
              {selectedJob.title}
            </h2>

            <p className="jm-job-modal-company">
              {selectedJob.company} · {selectedJob.location}
            </p>

            <div className="jm-job-modal-facts">
              <span>Salary: {selectedJob.salary}</span>
              <span>Type: {selectedJob.type}</span>
              <span>Experience: {selectedJob.experience}</span>
              <span>{selectedJob.match}% profile match</span>
            </div>

            <h3>About this role</h3>

            <p className="jm-job-modal-description">
              {selectedJob.description}
            </p>

            {selectedJob.responsibilities.length > 0 && (
              <>
                <h3>Responsibilities</h3>

                <ul>
                  {selectedJob.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {selectedJob.requirements.length > 0 && (
              <>
                <h3>What you'll need</h3>

                <ul>
                  {selectedJob.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {selectedJob.skills.length > 0 && (
              <>
                <h3>Relevant skills</h3>

                <div className="jm-job-skills jm-modal-skills">
                  {selectedJob.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </>
            )}

            {isApplicationRecorded(appliedJobs, selectedJob.id) && (
              <div className="jm-job-modal-applied">
                ✓ Your application is recorded in your account.
              </div>
            )}

            <div className="jm-job-modal-footer">
              <button
                type="button"
                className="jm-job-modal-save"
                disabled={savingJobId !== null}
                onClick={() => toggleSaved(selectedJob.id)}
              >
                {savingJobId === selectedJob.id
                  ? "Updating..."
                  : savedJobs.includes(selectedJob.id)
                    ? "♥ Saved"
                    : "♡ Save Job"}
              </button>

              <button
                type="button"
                className="jm-jobs-search-btn"
                disabled={
                  appliedJobs.includes(selectedJob.id) ||
                  applyingJobId !== null
                }
                onClick={() => applyForJob(selectedJob)}
              >
                {applyingJobId === selectedJob.id
                  ? "Applying..."
                  : appliedJobs.includes(selectedJob.id)
                    ? "Application Recorded"
                    : "Apply Now →"}
              </button>
            </div>

            <p className="jm-job-demo-disclaimer">
              JobMate AI records your application in your account.
              It does not submit an application directly to the employer.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

function isApplicationRecorded(appliedJobs, jobId) {
  return appliedJobs.includes(String(jobId));
}

export default Jobs;