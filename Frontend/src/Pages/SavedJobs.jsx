import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

// Extra details for the original jobs.
// Newly added jobs will get their details directly from MySQL.
const jobMetadata = {
  "python-developer": {
    match: 94,
    skills: ["Python", "SQL", "Django"],
    icon: "🐍",
    color: "purple",
    experience: "0–2 years",
  },
  "frontend-developer": {
    match: 89,
    skills: ["React.js", "JavaScript", "HTML", "CSS"],
    icon: "🎨",
    color: "pink",
    experience: "0–2 years",
  },
  "data-analyst": {
    match: 86,
    skills: ["Python", "SQL", "Pandas", "Excel"],
    icon: "📊",
    color: "blue",
    experience: "0–2 years",
  },
  "fullstack-developer": {
    match: 82,
    skills: ["React", "Python", "MySQL"],
    icon: "💻",
    color: "orange",
    experience: "0–2 years",
  },
};

const fallbackColors = ["purple", "pink", "blue", "orange"];

function formatJobTitle(jobId) {
  return String(jobId || "Job")
    .replace(/-[a-f0-9]{6}$/i, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function mapApiJob(record, index) {
  const id = String(record.job_key || record.id || "");
  const metadata = jobMetadata[id] || {};

  const company = record.company || "Company not specified";

  const rawSalary = String(
    record.salary || "Not specified"
  );

  const salary =
    /₹/.test(rawSalary) ||
    rawSalary === "Not specified" ||
    !/LPA/i.test(rawSalary)
      ? rawSalary
      : `₹${rawSalary}`;

  return {
    id,
    title: record.title || formatJobTitle(id),
    company,
    location: record.location || "Location not specified",
    salary,
    type:
      record.type ||
      record.employment_type ||
      "Full Time",
    match: metadata.match ?? 75,
    skills: metadata.skills || [],
    icon: metadata.icon || company.charAt(0).toUpperCase(),
    color:
      metadata.color ||
      fallbackColors[index % fallbackColors.length],
    experience: metadata.experience || "Not specified",
    status: record.status || "Active",
    description: record.description || "",
    created_at: record.created_at || null,
  };
}

function SavedJobs() {
  const navigate = useNavigate();

  const [savedIds, setSavedIds] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match");

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [notice, setNotice] = useState("");

  // =====================================
  // LOAD SAVED IDS AND JOB DETAILS
  // FROM FLASK / MYSQL
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    async function loadSavedJobs() {
      setLoading(true);

      try {
        // Fetch saved-job IDs and active job details together.
        const [savedResponse, jobsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/saved-jobs`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE_URL}/api/jobs`),
        ]);

        const savedData = await savedResponse
          .json()
          .catch(() => ({}));

        const jobsData = await jobsResponse
          .json()
          .catch(() => ({}));

        if (cancelled) return;

        if (!savedResponse.ok) {
          if (savedResponse.status === 401) {
            localStorage.removeItem("jobmate_token");
            setNotice(
              "Your session expired. Please log in again."
            );
          } else {
            setNotice(
              savedData.message ||
                "Could not load your saved jobs."
            );
          }

          setLoading(false);
          return;
        }

        if (!jobsResponse.ok) {
          setNotice(
            jobsData.message ||
              "Could not load job details from the database."
          );

          setLoading(false);
          return;
        }

        const ids = Array.isArray(savedData.saved_jobs)
          ? savedData.saved_jobs.map((job) =>
              String(job.job_id)
            )
          : [];

        const records = Array.isArray(jobsData.jobs)
          ? jobsData.jobs
          : [];

        const mappedJobs = records
          .map(mapApiJob)
          .filter((job) => Boolean(job.id));

        setSavedIds(ids);
        setJobs(mappedJobs);

        // Keep local saved-job state compatible with the app.
        localStorage.setItem(
          "jobmate_saved_jobs",
          JSON.stringify(ids)
        );

        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Saved jobs loading error:", error);

          setNotice(
            "Backend se connect nahi ho pa raha. Flask server check karo."
          );

          setLoading(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // =====================================
  // FILTER AND SORT SAVED JOBS
  // =====================================

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = jobs
      .filter((job) => savedIds.includes(job.id))
      .filter((job) => {
        const searchableText = [
          job.title,
          job.company,
          job.location,
          job.salary,
          job.type,
          job.experience,
          job.description,
          ...job.skills,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });

    results.sort((a, b) => {
      if (sortBy === "salary") {
        const salaryA = Number(
          a.salary.match(/\d+(?:\.\d+)?/)?.[0] || 0
        );

        const salaryB = Number(
          b.salary.match(/\d+(?:\.\d+)?/)?.[0] || 0
        );

        return salaryB - salaryA;
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      return b.match - a.match;
    });

    return results;
  }, [jobs, savedIds, search, sortBy]);

  // =====================================
  // REMOVE JOB FROM MYSQL
  // =====================================

  const removeJob = async (jobId) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (removingId !== null) return;

    const id = String(jobId);

    setRemovingId(id);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/saved-jobs/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice(
          response.status === 401
            ? "Please log in again to manage saved jobs."
            : data.message || "Could not remove this job."
        );

        return;
      }

      const updatedIds = savedIds.filter(
        (savedId) => savedId !== id
      );

      setSavedIds(updatedIds);

      localStorage.setItem(
        "jobmate_saved_jobs",
        JSON.stringify(updatedIds)
      );

      setNotice(
        data.message || "Job removed from your saved jobs."
      );
    } catch (error) {
      console.error("Remove saved job error:", error);

      setNotice(
        "Backend se connect nahi ho pa raha. Job remove nahi hui."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================
  // PAGE UI
  // =====================================

  return (
    <main className="sj-page">
      <section className="sj-hero">
        <div className="sj-hero-content">
          <span className="sj-eyebrow">
            <span className="sj-eyebrow-dot"></span>
            YOUR PERSONAL JOB COLLECTION
          </span>

          <h1>
            Your saved jobs,
            <br />
            <span>your next opportunity.</span>
          </h1>

          <p>
            Keep your favourite opportunities in one place.
            Review your saved roles and decide which opportunity
            to explore next.
          </p>

          <div className="sj-hero-actions">
            <button
              type="button"
              className="sj-primary-btn"
              onClick={() => navigate("/jobs")}
            >
              Explore More Jobs <span>→</span>
            </button>

            <div className="sj-saved-counter">
              <span className="sj-counter-icon">♡</span>

              <div>
                <strong>{savedIds.length}</strong>
                <small>Saved opportunities</small>
              </div>
            </div>
          </div>
        </div>

        <div className="sj-hero-art" aria-hidden="true">
          <div className="sj-orbit sj-orbit-one"></div>
          <div className="sj-orbit sj-orbit-two"></div>

          <div className="sj-floating-card sj-float-top">
            <span>✦</span> Career opportunities
          </div>

          <div className="sj-bookmark-illustration">
            <div className="sj-bookmark-shape">♡</div>
            <div className="sj-bookmark-spark">✦</div>
          </div>

          <div className="sj-floating-card sj-float-bottom">
            <span>✓</span> Your career, your choice
          </div>
        </div>
      </section>

      <section className="sj-content">
        <div className="sj-section-heading">
          <div>
            <span className="sj-section-label">
              YOUR COLLECTION
            </span>

            <h2>Saved opportunities</h2>

            <p>Jobs stored in your account.</p>
          </div>

          <button
            type="button"
            className="sj-outline-btn"
            onClick={() => navigate("/jobs")}
          >
            + Find jobs
          </button>
        </div>

        <div className="sj-toolbar">
          <div className="sj-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search saved jobs, companies or skills..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search saved jobs"
            />

            {search && (
              <button
                type="button"
                className="sj-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            className="sj-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort saved jobs"
          >
            <option value="match">Best match first</option>
            <option value="salary">Salary range</option>
            <option value="title">Job title A–Z</option>
          </select>
        </div>

        {notice && (
          <div className="jm-jobs-notice" role="status">
            <span>ℹ</span> {notice}

            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="sj-empty">
            <h3>Loading your saved jobs...</h3>
            <p>Fetching saved jobs and details from the database.</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="sj-job-list">
            {filteredJobs.map((job) => (
              <article className="sj-job-card" key={job.id}>
                <div className={`sj-company-icon ${job.color}`}>
                  {job.icon}
                </div>

                <div className="sj-job-main">
                  <div className="sj-job-title-row">
                    <h3>{job.title}</h3>

                    <span className="sj-match">
                      {job.match}% match
                    </span>
                  </div>

                  <div className="sj-company-name">
                    {job.company}
                  </div>

                  <div className="sj-job-meta">
                    <span>⌖ {job.location}</span>
                    <span>◷ {job.experience}</span>
                    <span>◈ {job.type}</span>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="sj-skills">
                      {job.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sj-job-side">
                  <div className="sj-salary">
                    {job.salary}
                  </div>

                  <span className="sj-salary-caption">
                    per annum
                  </span>

                  <div className="sj-job-actions">
                    <button
                      type="button"
                      className="sj-apply-btn"
                      onClick={() => navigate("/jobs")}
                    >
                      View job <span>→</span>
                    </button>

                    <button
                      type="button"
                      className="sj-remove-btn"
                      disabled={removingId !== null}
                      onClick={() => removeJob(job.id)}
                      title="Remove from saved jobs"
                      aria-label={`Remove ${job.title} from saved jobs`}
                    >
                      {removingId === job.id
                        ? "Removing..."
                        : "♡ Remove"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sj-empty">
            <div className="sj-empty-illustration">
              <span>♡</span>
            </div>

            <h3>
              {search
                ? "No matching saved jobs"
                : "Your next opportunity awaits"}
            </h3>

            <p>
              {search
                ? "Try another search term or clear your search."
                : "You haven't saved any jobs in this account yet. Explore jobs and save your favourites."}
            </p>

            <button
              type="button"
              className="sj-primary-btn"
              onClick={() => {
                if (search) {
                  setSearch("");
                } else {
                  navigate("/jobs");
                }
              }}
            >
              {search ? "Clear search" : "Explore Jobs"} <span>→</span>
            </button>
          </div>
        )}

        <div className="sj-bottom-note">
          <span className="sj-note-icon">✦</span>

          <div>
            <strong>A little career tip</strong>

            <p>
              Save roles that match your skills, then compare their
              requirements to plan what you should learn next.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SavedJobs;