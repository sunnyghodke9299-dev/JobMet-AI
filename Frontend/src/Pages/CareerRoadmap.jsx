import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const initialSteps = [
  {
    id: 1,
    phase: "FOUNDATION",
    title: "Python Fundamentals",
    duration: "2 weeks",
    description: "Build a strong foundation in Python programming.",
    topics: ["Variables and data types", "Conditions and loops", "Functions and OOP"],
    tasks: [
      "Practise basic Python programs",
      "Learn functions and exception handling",
      "Build a small command-line project",
    ],
  },
  {
    id: 2,
    phase: "FRONTEND",
    title: "React.js Development",
    duration: "3 weeks",
    description: "Create responsive interfaces using React components.",
    topics: ["Components and props", "Hooks and state", "Routing and API calls"],
    tasks: [
      "Build reusable React components",
      "Practise state and effect hooks",
      "Create a responsive multi-page application",
    ],
  },
  {
    id: 3,
    phase: "DATABASE",
    title: "SQL & Database Design",
    duration: "2 weeks",
    description: "Learn to structure, query and manage relational data.",
    topics: ["SELECT and JOIN", "Keys and relationships", "Database design"],
    tasks: [
      "Practise SQL queries and joins",
      "Design tables for a sample application",
      "Connect an application to a database",
    ],
  },
  {
    id: 4,
    phase: "BACKEND",
    title: "Python Flask & APIs",
    duration: "3 weeks",
    description: "Build backend services and connect them with your frontend.",
    topics: ["REST APIs", "Authentication", "Validation and security"],
    tasks: [
      "Create Flask API endpoints",
      "Connect React to the Flask backend",
      "Implement authentication and error handling",
    ],
  },
  {
    id: 5,
    phase: "AI PROJECTS",
    title: "AI & Machine Learning Basics",
    duration: "3 weeks",
    description: "Understand the fundamentals behind AI-powered applications.",
    topics: ["Data preparation", "Model and API concepts", "AI integration"],
    tasks: [
      "Learn basic data preparation with Python",
      "Experiment with an AI API",
      "Create a small AI-powered feature",
    ],
  },
  {
    id: 6,
    phase: "CAREER READY",
    title: "Portfolio & Interview Preparation",
    duration: "2 weeks",
    description: "Prepare projects and practise explaining your technical work.",
    topics: ["GitHub portfolio", "Technical questions", "Mock interviews"],
    tasks: [
      "Document a full-stack project on GitHub",
      "Prepare project explanations for interviews",
      "Practise technical interview questions",
    ],
  },
];

const readProgress = () => {
  try {
    const value = JSON.parse(
      localStorage.getItem("jobmate_roadmap_progress") || "{}"
    );

    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
};

const readSavedRoadmap = () => {
  try {
    const value = JSON.parse(
      localStorage.getItem("jobmate_generated_roadmap") || "null"
    );

    return Array.isArray(value) && value.length > 0
      ? value
      : initialSteps;
  } catch {
    return initialSteps;
  }
};

const readSavedSummary = () => {
  try {
    return localStorage.getItem("jobmate_generated_roadmap_summary") || "";
  } catch {
    return "";
  }
};

function CareerRoadmap() {
  const [steps, setSteps] = useState(readSavedRoadmap);
  const [completedTasks, setCompletedTasks] = useState(readProgress);
  const [expandedStep, setExpandedStep] = useState(() => {
    const saved = readSavedRoadmap();
    return saved[0]?.id ?? 1;
  });
  const [filter, setFilter] = useState("All");

  const [targetRole, setTargetRole] = useState("Python Developer");
  const [currentSkills, setCurrentSkills] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const [generating, setGenerating] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [roadmapError, setRoadmapError] = useState("");
  const [roadmapNotice, setRoadmapNotice] = useState("");
  const [roadmapSummary, setRoadmapSummary] = useState(readSavedSummary);

  const [isAiRoadmap, setIsAiRoadmap] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("jobmate_generated_roadmap") || "null"
      );
      return Array.isArray(saved) && saved.length > 0;
    } catch {
      return false;
    }
  });

  // =====================================
  // LOAD SAVED ROADMAP FROM MYSQL
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("jobmate_token");
    let cancelled = false;

    async function loadRoadmap() {
      if (!token) {
        if (!cancelled) {
          setLoadingRoadmap(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/career-roadmap`,
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
            data.message || "Could not load your saved career roadmap."
          );
        }

        const saved = data.roadmap;

        if (
          saved &&
          Array.isArray(saved.steps) &&
          saved.steps.length > 0 &&
          !cancelled
        ) {
          const loadedProgress =
            saved.progress &&
            typeof saved.progress === "object" &&
            !Array.isArray(saved.progress)
              ? saved.progress
              : {};

          setSteps(saved.steps);
          setCompletedTasks(loadedProgress);
          setTargetRole(saved.target_role || "Python Developer");
          setCurrentSkills(saved.current_skills || "");
          setHoursPerWeek(Number(saved.hours_per_week) || 10);
          setRoadmapSummary(saved.summary || "");
          setExpandedStep(saved.steps[0]?.id ?? null);
          setFilter("All");
          setIsAiRoadmap(Boolean(saved.summary));

          localStorage.setItem(
            "jobmate_generated_roadmap",
            JSON.stringify(saved.steps)
          );

          localStorage.setItem(
            "jobmate_roadmap_progress",
            JSON.stringify(loadedProgress)
          );

          localStorage.setItem(
            "jobmate_generated_roadmap_summary",
            saved.summary || ""
          );
        }
      } catch (error) {
        if (!cancelled) {
          setRoadmapError(
            error.message ||
              "Could not load your roadmap from MySQL."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRoadmap(false);
        }
      }
    }

    loadRoadmap();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================
  // SAVE ROADMAP AND PROGRESS TO MYSQL
  // =====================================

  const saveRoadmapToDatabase = async ({
    stepsToSave,
    progressToSave,
    targetRoleToSave,
    currentSkillsToSave,
    hoursToSave,
    summaryToSave,
  }) => {
    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      throw new Error("Please log in to save your career roadmap.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/career-roadmap`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_role: targetRoleToSave,
          current_skills: currentSkillsToSave,
          hours_per_week: Number(hoursToSave),
          summary: summaryToSave || "",
          steps: stepsToSave,
          progress: progressToSave,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Could not save the roadmap to MySQL."
      );
    }

    return data;
  };

  // =====================================
  // PROGRESS CALCULATIONS
  // =====================================

  const getStepProgress = (step) => {
    const completed = step.tasks.filter(
      (_, index) => completedTasks[`${step.id}-${index}`]
    ).length;

    return {
      completed,
      total: step.tasks.length,
      percent: step.tasks.length
        ? Math.round((completed / step.tasks.length) * 100)
        : 0,
    };
  };

  const totalTasks = steps.reduce(
    (total, step) => total + step.tasks.length,
    0
  );

  const finishedTasks = steps.reduce(
    (total, step) => total + getStepProgress(step).completed,
    0
  );

  const overallProgress = totalTasks
    ? Math.round((finishedTasks / totalTasks) * 100)
    : 0;

  const filteredSteps = steps.filter((step) => {
    const progress = getStepProgress(step);

    if (filter === "Completed") {
      return progress.percent === 100;
    }

    if (filter === "In Progress") {
      return progress.percent > 0 && progress.percent < 100;
    }

    if (filter === "Not Started") {
      return progress.percent === 0;
    }

    return true;
  });

  // =====================================
  // TOGGLE TASK AND SAVE PROGRESS
  // =====================================

  const toggleTask = async (step, taskIndex) => {
    const key = `${step.id}-${taskIndex}`;

    const nextProgress = {
      ...completedTasks,
      [key]: !completedTasks[key],
    };

    setCompletedTasks(nextProgress);

    try {
      localStorage.setItem(
        "jobmate_roadmap_progress",
        JSON.stringify(nextProgress)
      );
    } catch {
      // MySQL save can still proceed.
    }

    // Save the entire current roadmap and its progress.
    setSavingProgress(true);
    setRoadmapError("");
    setRoadmapNotice("");

    try {
      await saveRoadmapToDatabase({
        stepsToSave: steps,
        progressToSave: nextProgress,
        targetRoleToSave: targetRole,
        currentSkillsToSave: currentSkills,
        hoursToSave: hoursPerWeek,
        summaryToSave: roadmapSummary,
      });

      setRoadmapNotice("Your learning progress was saved to MySQL.");
    } catch (error) {
      setRoadmapError(
        `Progress changed in this browser but could not be saved to MySQL. ${error.message}`
      );
    } finally {
      setSavingProgress(false);
    }
  };

  // =====================================
  // GENERATE PERSONALIZED AI ROADMAP
  // =====================================

  const generateRoadmap = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setRoadmapError("Please log in before generating your roadmap.");
      return;
    }

    if (!targetRole.trim()) {
      setRoadmapError("Please enter your career goal.");
      return;
    }

    if (generating) return;

    setGenerating(true);
    setRoadmapError("");
    setRoadmapNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/career-roadmap/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target_role: targetRole.trim(),
            current_skills: currentSkills.trim(),
            hours_per_week: Number(hoursPerWeek),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not generate your career roadmap."
        );
      }

      const roadmap = data.roadmap || data;

      if (!Array.isArray(roadmap.steps) || roadmap.steps.length === 0) {
        throw new Error(
          "The server response did not contain any roadmap steps."
        );
      }

      const newSteps = roadmap.steps.slice(0, 8).map((step, index) => {
        const topics = Array.isArray(step.topics)
          ? step.topics.filter(
              (item) => typeof item === "string" && item.trim()
            )
          : [];

        const tasks = Array.isArray(step.tasks)
          ? step.tasks.filter(
              (item) => typeof item === "string" && item.trim()
            )
          : [];

        return {
          id: `ai-${index + 1}`,
          phase: String(step.phase || `STAGE ${index + 1}`),
          title: String(step.title || `Learning Stage ${index + 1}`),
          duration: String(step.duration || "1 week"),
          description: String(step.description || ""),
          topics,
          tasks:
            tasks.length > 0
              ? tasks.slice(0, 8)
              : ["Practise the topics covered in this stage."],
        };
      });

      const newSummary =
        typeof roadmap.summary === "string" && roadmap.summary.trim()
          ? roadmap.summary
          : `Personalized learning roadmap for ${targetRole}.`;

      const emptyProgress = {};

      // Update the page and browser fallback immediately.
      setSteps(newSteps);
      setCompletedTasks(emptyProgress);
      setExpandedStep(newSteps[0].id);
      setFilter("All");
      setIsAiRoadmap(true);
      setRoadmapSummary(newSummary);

      try {
        localStorage.setItem(
          "jobmate_generated_roadmap",
          JSON.stringify(newSteps)
        );

        localStorage.setItem(
          "jobmate_roadmap_progress",
          JSON.stringify(emptyProgress)
        );

        localStorage.setItem(
          "jobmate_generated_roadmap_summary",
          newSummary
        );
      } catch {
        // Continue; the database save is attempted separately.
      }

      // Persist the newly generated roadmap in the user's MySQL record.
      try {
        await saveRoadmapToDatabase({
          stepsToSave: newSteps,
          progressToSave: emptyProgress,
          targetRoleToSave: targetRole.trim(),
          currentSkillsToSave: currentSkills.trim(),
          hoursToSave: Number(hoursPerWeek),
          summaryToSave: newSummary,
        });

        setRoadmapNotice(
          "AI roadmap generated and saved to your account database."
        );
      } catch (error) {
        setRoadmapError(
          `Roadmap generated, but MySQL save failed. ${error.message}`
        );
      }

      window.setTimeout(() => {
        document
          .getElementById("cr-roadmap-list")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      setRoadmapError(
        error.message || "Could not connect to the roadmap API."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="cr-page">
      <div className="cr-container">
        {/* Hero */}
        <header className="cr-hero">
          <div>
            <span className="cr-eyebrow">
              ✦ YOUR PERSONAL GROWTH PLAN
            </span>

            <h1>
              Your Career <span>Roadmap</span>
            </h1>

            <p>
              Turn your learning goals into manageable steps. Track
              milestones, practise consistently and prepare for your
              next career opportunity.
            </p>

            <div className="cr-hero-tags">
              <span>{steps.length} learning stages</span>
              <span>{totalTasks} practical tasks</span>
              <span>Track your progress</span>
            </div>
          </div>

          <div className="cr-hero-art" aria-hidden="true">
            <div className="cr-art-orbit" />
            <div className="cr-art-center">✦</div>
            <div className="cr-art-node node-one">✓</div>
            <div className="cr-art-node node-two">02</div>
            <div className="cr-art-node node-three">03</div>
            <div className="cr-art-node node-four">↗</div>
          </div>
        </header>

        {/* AI Roadmap Generator */}
        <section
          className="cr-progress-card"
          style={{ marginBottom: "24px" }}
        >
          <span className="cr-section-label">
            PERSONALIZED CAREER PLANNING
          </span>

          <h2 style={{ marginTop: "10px" }}>
            Generate Your AI Career Roadmap
          </h2>

          <p>
            Tell us your career goal, current skills and weekly study
            time to create a learning plan for your goals.
          </p>

          <form
            onSubmit={generateRoadmap}
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            <label style={{ display: "grid", gap: "8px" }}>
              Career goal

              <input
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                maxLength={100}
                required
                disabled={generating}
                placeholder="e.g. Python Developer"
                style={{
                  padding: "12px",
                  border: "1px solid #e5d5ff",
                  borderRadius: "10px",
                  width: "100%",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              Your current skills

              <textarea
                value={currentSkills}
                onChange={(event) =>
                  setCurrentSkills(event.target.value)
                }
                maxLength={3000}
                rows={3}
                disabled={generating}
                placeholder="e.g. Python, SQL, React, MySQL, HTML, CSS"
                style={{
                  padding: "12px",
                  border: "1px solid #e5d5ff",
                  borderRadius: "10px",
                  width: "100%",
                  resize: "vertical",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              Available study hours per week

              <input
                type="number"
                min="1"
                max="80"
                value={hoursPerWeek}
                onChange={(event) =>
                  setHoursPerWeek(event.target.value)
                }
                required
                disabled={generating}
                style={{
                  padding: "12px",
                  border: "1px solid #e5d5ff",
                  borderRadius: "10px",
                  width: "100%",
                }}
              />
            </label>

            {roadmapError && (
              <div className="cr-empty" role="alert">
                {roadmapError}
              </div>
            )}

            {roadmapNotice && (
              <div className="cr-stage-success" role="status">
                {roadmapNotice}
              </div>
            )}

            {loadingRoadmap && (
              <p>Loading your saved roadmap from MySQL...</p>
            )}

            <button
              type="submit"
              disabled={generating || loadingRoadmap}
              style={{
                padding: "14px 22px",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 700,
                cursor:
                  generating || loadingRoadmap ? "wait" : "pointer",
                background:
                  "linear-gradient(90deg, #8b3ff2, #df3da8)",
                opacity: generating || loadingRoadmap ? 0.7 : 1,
              }}
            >
              {generating
                ? "Generating Roadmap..."
                : "✦ Generate AI Roadmap →"}
            </button>
          </form>

          {isAiRoadmap && roadmapSummary && (
            <div
              className="cr-stage-success"
              style={{ marginTop: "18px" }}
            >
              <strong>AI roadmap</strong>
              <p>{roadmapSummary}</p>
            </div>
          )}

          {savingProgress && (
            <p style={{ marginTop: "12px" }}>
              Saving your learning progress...
            </p>
          )}
        </section>

        {/* Progress overview */}
        <section className="cr-progress-card">
          <div className="cr-progress-main">
            <span className="cr-progress-icon">◎</span>

            <div>
              <span className="cr-section-label">
                YOUR LEARNING PROGRESS
              </span>

              <h2>{overallProgress}% completed</h2>

              <p>
                {finishedTasks} of {totalTasks} tasks completed across
                your career learning plan.
              </p>
            </div>
          </div>

          <div className="cr-overall-meter">
            <div style={{ width: `${overallProgress}%` }} />
          </div>

          <div className="cr-progress-footer">
            <span>Getting started is progress in itself.</span>
            <strong>{steps.length} stages</strong>
          </div>
        </section>

        {/* Roadmap and filters */}
        <section className="cr-roadmap-section" id="cr-roadmap-list">
          <div className="cr-section-heading">
            <div>
              <span className="cr-section-label">
                YOUR LEARNING JOURNEY
              </span>

              <h2>Step by step</h2>

              <p>
                Open a stage to view its topics and tick off completed tasks.
              </p>
            </div>

            <label className="cr-filter">
              <span>Show</span>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option>All</option>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
          </div>

          <div className="cr-step-list">
            {filteredSteps.map((step) => {
              const progress = getStepProgress(step);
              const isExpanded = expandedStep === step.id;
              const isCompleted = progress.percent === 100;

              return (
                <article
                  key={step.id}
                  className={`cr-step-card ${
                    isExpanded ? "expanded" : ""
                  } ${isCompleted ? "step-complete" : ""}`}
                >
                  <button
                    type="button"
                    className="cr-step-header"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : step.id)
                    }
                  >
                    <span className={`cr-step-number step-${step.id}`}>
                      {isCompleted
                        ? "✓"
                        : typeof step.id === "number"
                          ? String(step.id).padStart(2, "0")
                          : String(steps.indexOf(step) + 1).padStart(
                              2,
                              "0"
                            )}
                    </span>

                    <span className="cr-step-heading">
                      <span className="cr-step-phase">{step.phase}</span>
                      <strong>{step.title}</strong>
                      <small>{step.description}</small>
                    </span>

                    <span className="cr-step-summary">
                      <strong>{progress.percent}%</strong>
                      <small>
                        {progress.completed}/{progress.total} tasks
                      </small>
                    </span>

                    <span className="cr-step-chevron">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>

                  <div className="cr-step-progress-track">
                    <div style={{ width: `${progress.percent}%` }} />
                  </div>

                  {isExpanded && (
                    <div className="cr-step-content">
                      <div className="cr-step-meta">
                        <span>◷ Suggested duration: {step.duration}</span>
                        <span>
                          ✓ {progress.completed} tasks completed
                        </span>
                      </div>

                      <h3>Topics to learn</h3>

                      <div className="cr-topic-list">
                        {step.topics.map((topic) => (
                          <span key={topic}>
                            <b>✓</b> {topic}
                          </span>
                        ))}
                      </div>

                      <h3>Your task checklist</h3>

                      <div className="cr-task-list">
                        {step.tasks.map((task, index) => {
                          const taskKey = `${step.id}-${index}`;

                          return (
                            <label
                              className={`cr-task ${
                                completedTasks[taskKey] ? "checked" : ""
                              }`}
                              key={taskKey}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(completedTasks[taskKey])}
                                disabled={savingProgress}
                                onChange={() => toggleTask(step, index)}
                              />

                              <span className="cr-custom-check">
                                {completedTasks[taskKey] ? "✓" : ""}
                              </span>

                              <span>{task}</span>
                            </label>
                          );
                        })}
                      </div>

                      {isCompleted && (
                        <div className="cr-stage-success">
                          ✓ Stage completed! Great work.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filteredSteps.length === 0 && (
            <div className="cr-empty">
              <span>✦</span>
              <h3>No stages in this category</h3>
              <p>Try another filter to view your learning stages.</p>

              <button
                type="button"
                onClick={() => setFilter("All")}
              >
                Show All Stages
              </button>
            </div>
          )}
        </section>

        {/* Bottom banner */}
        <section className="cr-bottom-banner">
          <div className="cr-banner-icon">✦</div>

          <div>
            <h3>Consistency beats perfection.</h3>
            <p>
              Complete one small task today and keep building your future.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextStep = steps.find(
                (step) => getStepProgress(step).percent < 100
              );

              if (nextStep) {
                setExpandedStep(nextStep.id);
                setFilter("All");

                window.setTimeout(() => {
                  document
                    .getElementById("cr-roadmap-list")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }, 50);
              }
            }}
          >
            Continue Learning →
          </button>
        </section>

        <footer className="cr-footer">
          <span>✦ JobMate AI</span>
          <p>Your next chapter starts with what you learn today.</p>
        </footer>
      </div>
    </main>
  );
}

export default CareerRoadmap;