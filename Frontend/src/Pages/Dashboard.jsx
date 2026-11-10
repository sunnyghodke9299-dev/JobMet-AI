
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const skills = [
  { name: "Python", score: 90, color: "purple" },
  { name: "React.js", score: 82, color: "pink" },
  { name: "SQL", score: 86, color: "blue" },
  { name: "JavaScript", score: 78, color: "orange" },
  { name: "DSA", score: 62, color: "green" },
];

const jobs = [
  {
    title: "Python Developer",
    company: "TechNova Solutions",
    match: 94,
    salary: "₹5–8 LPA",
    type: "Full-time",
    logo: "T",
    color: "violet",
  },
  {
    title: "Frontend Developer",
    company: "CreativeSoft",
    match: 89,
    salary: "₹4–7 LPA",
    type: "Hybrid",
    logo: "C",
    color: "pink",
  },
  {
    title: "Data Analyst",
    company: "DataVision",
    match: 86,
    salary: "₹5–9 LPA",
    type: "Full-time",
    logo: "D",
    color: "blue",
  },
];

const roadmap = [
  {
    title: "Python Fundamentals",
    detail: "Core programming concepts",
    status: "completed",
  },
  {
    title: "React.js Development",
    detail: "Frontend development skills",
    status: "completed",
  },
  {
    title: "Data Structures & Algorithms",
    detail: "Your current learning goal",
    status: "active",
  },
  {
    title: "Interview Preparation",
    detail: "Practise and prepare for interviews",
    status: "upcoming",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("Sandy");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("jobmate_user");

      if (savedUser) {
        const user = JSON.parse(savedUser);

        if (user.name) {
          setName(user.name.trim().split(/\s+/)[0]);
        }
      }
    } catch {
      setName("Sandy");
    }
  }, []);

  const stats = [
    {
      icon: "◉",
      label: "Career Readiness",
      value: "82%",
      note: "+6% this month",
      className: "readiness",
    },
    {
      icon: "▤",
      label: "Resume Score",
      value: "84",
      suffix: "/100",
      note: "Good progress",
      className: "resume",
    },
    {
      icon: "▣",
      label: "Job Matches",
      value: "24",
      note: "8 new matches",
      className: "matches",
    },
    {
      icon: "↗",
      label: "Applications",
      value: "7",
      note: "2 interviews",
      className: "applications",
    },
  ];

  return (
    <main className="jm-dashboard">
      <div className="jm-dashboard-container">

        {/* Welcome header */}
        <section className="jm-welcome">
          <div className="jm-welcome-copy">
            <div className="jm-eyebrow">
              <span className="jm-eyebrow-dot" />
              YOUR PERSONAL CAREER SPACE
            </div>

            <h1>
              Welcome back, <span>{name}!</span>
            </h1>

            <p>
              Your next opportunity starts here. Track your progress,
              strengthen your skills and move closer to your dream career.
            </p>
          </div>

          <button
            type="button"
            className="jm-primary-btn"
            onClick={() => navigate("/resume-analyzer")}
          >
            <span>＋</span> Analyze Resume
          </button>
        </section>

        {/* Career statistics */}
        <section
          className="jm-stat-grid"
          aria-label="Career statistics"
        >
          {stats.map((stat) => (
            <article className="jm-stat-card" key={stat.label}>
              <div className={`jm-stat-icon ${stat.className}`}>
                {stat.icon}
              </div>

              <div className="jm-stat-content">
                <p>{stat.label}</p>

                <div className="jm-stat-value">
                  <strong>{stat.value}</strong>
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>

                <span className="jm-stat-note">
                  <span>↗</span> {stat.note}
                </span>
              </div>

              <span className="jm-stat-decoration" />
            </article>
          ))}
        </section>

        {/* Main dashboard grid */}
        <section className="jm-dashboard-grid">

          {/* Skills */}
          <article className="jm-panel jm-skills-panel">
            <div className="jm-panel-heading">
              <div>
                <span className="jm-section-kicker">
                  YOUR DEVELOPMENT
                </span>

                <h2>My Skills</h2>

                <p>Build the skills employers are looking for.</p>
              </div>

              <button
                type="button"
                className="jm-text-btn"
                onClick={() => navigate("/resume-analyzer")}
              >
                Explore <span>→</span>
              </button>
            </div>

            <div className="jm-skill-list">
              {skills.map((skill) => (
                <div className="jm-skill-item" key={skill.name}>
                  <div className="jm-skill-label">
                    <span>{skill.name}</span>
                    <strong>{skill.score}%</strong>
                  </div>

                  <div
                    className="jm-skill-track"
                    role="progressbar"
                    aria-label={`${skill.name} skill level`}
                    aria-valuenow={skill.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`jm-skill-fill ${skill.color}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="jm-skill-footer">
              <span className="jm-mini-check">✓</span>

              <p>
                <strong>Good momentum!</strong> Keep practising to improve
                your overall profile.
              </p>
            </div>
          </article>

          {/* Career readiness */}
          <article className="jm-panel jm-readiness-panel">
            <div className="jm-panel-heading">
              <div>
                <span className="jm-section-kicker">AI INSIGHTS</span>
                <h2>Career Readiness</h2>
                <p>Your current career progress.</p>
              </div>

              <span className="jm-ai-badge">✦ AI</span>
            </div>

            <div className="jm-score-area">
              <div
                className="jm-score-ring"
                role="img"
                aria-label="Career readiness 82 percent"
              >
                <div className="jm-score-inner">
                  <strong>
                    82<span>%</span>
                  </strong>
                  <small>Readiness</small>
                </div>
              </div>

              <div className="jm-score-caption">
                <span className="jm-status-pill">
                  Great progress
                </span>

                <h3>You're getting closer!</h3>

                <p>
                  Strengthen your DSA and problem-solving skills to prepare
                  for developer interviews.
                </p>
              </div>
            </div>

            <div className="jm-readiness-divider" />

            <div className="jm-next-step">
              <div className="jm-next-step-icon">✦</div>

              <div>
                <strong>Your next step</strong>
                <p>Practise DSA for 30 minutes every day.</p>
              </div>
            </div>

            <button
              type="button"
              className="jm-secondary-btn"
              onClick={() => navigate("/resume-analyzer")}
            >
              Improve My Profile <span>→</span>
            </button>
          </article>

          {/* Recommended jobs */}
          <article className="jm-panel jm-jobs-panel">
            <div className="jm-panel-heading">
              <div>
                <span className="jm-section-kicker">
                  MADE FOR YOU
                </span>

                <h2>Recommended Jobs</h2>

                <p>Opportunities matched to your skills.</p>
              </div>

              <button
                type="button"
                className="jm-text-btn"
                onClick={() => navigate("/jobs")}
              >
                View all <span>→</span>
              </button>
            </div>

            <div className="jm-job-list">
              {jobs.map((job) => (
                <article className="jm-job-item" key={job.title}>
                  <div className={`jm-company-logo ${job.color}`}>
                    {job.logo}
                  </div>

                  <div className="jm-job-info">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>

                    <div className="jm-job-meta">
                      <span>{job.salary}</span>
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <div className="jm-match">
                    <strong>{job.match}%</strong>
                    <span>match</span>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="jm-outline-btn"
              onClick={() => navigate("/jobs")}
            >
              Explore All Opportunities <span>→</span>
            </button>
          </article>

          {/* Career roadmap */}
          <article className="jm-panel jm-roadmap-panel">
            <div className="jm-panel-heading">
              <div>
                <span className="jm-section-kicker">
                  YOUR LEARNING JOURNEY
                </span>

                <h2>Career Roadmap</h2>

                <p>One step at a time, towards your goal.</p>
              </div>

              <span className="jm-roadmap-count">
                {roadmap.length} steps
              </span>
            </div>

            <div className="jm-roadmap-list">
              {roadmap.map((step, index) => (
                <div
                  className={`jm-roadmap-item ${step.status}`}
                  key={step.title}
                >
                  <div className="jm-roadmap-marker">
                    {step.status === "completed" ? "✓" : index + 1}
                  </div>

                  <div className="jm-roadmap-copy">
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>

                  <span className="jm-roadmap-status">
                    {step.status === "completed"
                      ? "Done"
                      : step.status === "active"
                      ? "In progress"
                      : "Upcoming"}
                  </span>
                </div>
              ))}
            </div>

<button
  type="button"
  className="jm-text-btn"
  onClick={() => navigate("/career-roadmap")}
>
  Open Roadmap <span>→</span>
</button>

          </article>
        </section>

        {/* Quick actions */}
        <section className="jm-quick-section">
          <div className="jm-quick-heading">
            <div>
              <span className="jm-section-kicker">
                KEEP MOVING FORWARD
              </span>

              <h2>Quick Actions</h2>

              <p>Small steps today. Big career goals tomorrow.</p>
            </div>
          </div>

          <div className="jm-quick-grid">

            <button
              type="button"
              className="jm-quick-card"
              onClick={() => navigate("/resume-analyzer")}
            >
              <span className="jm-quick-icon purple">▤</span>

              <span className="jm-quick-copy">
                <strong>Analyze Resume</strong>
                <small>
                  Discover ways to improve your resume.
                </small>
              </span>

              <span className="jm-quick-arrow">↗</span>
            </button>

            <button
              type="button"
              className="jm-quick-card"
              onClick={() => navigate("/jobs")}
            >
              <span className="jm-quick-icon pink">▣</span>

              <span className="jm-quick-copy">
                <strong>Find Matching Jobs</strong>
                <small>
                  Explore your next opportunity.
                </small>
              </span>

              <span className="jm-quick-arrow">↗</span>
            </button>

            <button
              type="button"
              className="jm-quick-card"
              onClick={() => navigate("/interview-practice")}
            >
              <span className="jm-quick-icon blue">◎</span>

              <span className="jm-quick-copy">
                <strong>Practice Interview</strong>
                <small>
                  Answer technical questions and review sample answers.
                </small>
              </span>

              <span className="jm-quick-arrow">↗</span>
            </button>

            <button
              type="button"
              className="jm-quick-card"
              onClick={() => navigate("/project-generator")}
            >
              <span className="jm-quick-icon orange">✦</span>

              <span className="jm-quick-copy">
                <strong>Generate Projects</strong>
                <small>
                  Explore project ideas and step-by-step plans.
                </small>
              </span>

              <span className="jm-quick-arrow">↗</span>
            </button>

          </div>
        </section>

        {/* Footer */}
        <footer className="jm-dashboard-footer">
          <span>✦ JobMate AI</span>
          <p>Your career journey, powered by possibilities.</p>
        </footer>

      </div>
    </main>
  );
}

export default Dashboard;
