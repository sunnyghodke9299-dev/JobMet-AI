
import { useState } from "react";

const projectLibrary = [
  {
    title: "AI Resume Analyzer",
    category: "AI & Machine Learning",
    level: "Intermediate",
    technologies: ["React", "Python", "SQL"],
    description:
      "Build a platform that analyses resumes, extracts skills and identifies areas for improvement.",
    features: [
      "Resume upload and text extraction",
      "Skill detection and resume feedback",
      "Job compatibility scoring",
      "Downloadable analysis report",
    ],
    steps: [
      "Create a React resume upload interface",
      "Build a Flask API for file processing",
      "Extract text and detect relevant skills",
      "Store results and show an analysis report",
    ],
  },
  {
    title: "Smart Job Matching Platform",
    category: "Web Development",
    level: "Intermediate",
    technologies: ["React", "Python", "SQL"],
    description:
      "Match job seekers with relevant roles using skills, preferences and job requirements.",
    features: [
      "Job search and filters",
      "Candidate skill profiles",
      "Job compatibility score",
      "Saved jobs and application tracking",
    ],
    steps: [
      "Design job listings and candidate profiles",
      "Create database tables for jobs and skills",
      "Build matching logic using skill overlap",
      "Add filters, saved jobs and applications",
    ],
  },
  {
    title: "Sales Insights Dashboard",
    category: "Data Science",
    level: "Beginner",
    technologies: ["Python", "SQL"],
    description:
      "Analyse sales data and present revenue trends, top products and monthly performance.",
    features: [
      "CSV data import",
      "Monthly sales summaries",
      "Top products and customer insights",
      "Interactive charts and filters",
    ],
    steps: [
      "Find or create a sample sales dataset",
      "Clean the data with Python and Pandas",
      "Write SQL queries for key metrics",
      "Build charts and summarise insights",
    ],
  },
  {
    title: "AI Interview Coach",
    category: "AI & Machine Learning",
    level: "Advanced",
    technologies: ["React", "Python", "SQL"],
    description:
      "Create an interview practice platform that asks role-based questions and helps users improve their answers.",
    features: [
      "Role-based interview questions",
      "Answer history and practice sessions",
      "AI feedback and improvement suggestions",
      "Progress dashboard",
    ],
    steps: [
      "Create role and question selection",
      "Build an answer editor and session history",
      "Integrate an AI model for feedback",
      "Track progress across practice sessions",
    ],
  },
  {
    title: "Personal Expense Tracker",
    category: "Web Development",
    level: "Beginner",
    technologies: ["React", "Python", "SQL"],
    description:
      "Track spending, manage budgets and understand where money goes each month.",
    features: [
      "Add income and expenses",
      "Monthly category budgets",
      "Spending charts",
      "Transaction search and filters",
    ],
    steps: [
      "Design transaction forms and dashboard",
      "Create SQL tables for transactions",
      "Build APIs for creating and listing entries",
      "Add monthly summaries and charts",
    ],
  },
  {
    title: "Student Performance Predictor",
    category: "Data Science",
    level: "Advanced",
    technologies: ["Python", "SQL"],
    description:
      "Explore student performance data and train a model to estimate outcomes using historical patterns.",
    features: [
      "Dataset exploration",
      "Data cleaning and feature engineering",
      "Model training and evaluation",
      "Prediction results with limitations explained",
    ],
    steps: [
      "Select a suitable educational dataset",
      "Explore patterns using Pandas",
      "Train and evaluate a baseline model",
      "Build a small interface for predictions",
    ],
  },
];

const techOptions = ["All", "React", "Python", "SQL"];
const categoryOptions = [
  "All",
  "Web Development",
  "Data Science",
  "AI & Machine Learning",
];
const levelOptions = ["All", "Beginner", "Intermediate", "Advanced"];

function ProjectGenerator() {
  const [technology, setTechnology] = useState("All");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [generated, setGenerated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const results = projectLibrary.filter((project) => {
    const matchesTech =
      technology === "All" || project.technologies.includes(technology);
    const matchesCategory =
      category === "All" || project.category === category;
    const matchesLevel = level === "All" || project.level === level;

    return matchesTech && matchesCategory && matchesLevel;
  });

  const generateProjects = () => {
    setGenerated(true);
    setSelectedProject(null);
  };

  return (
    <main className="feature-page">
      <div className="feature-container">
        <header className="feature-hero">
          <span className="feature-eyebrow">✦ AI PROJECT DISCOVERY STUDIO</span>
          <h1>Build something <span>remarkable.</span></h1>
          <p>
            Find portfolio project ideas that match your skills, explore
            practical features and turn your learning into real experience.
          </p>
        </header>

        <section className="project-generator-panel">
          <div className="generator-title">
            <div className="generator-sparkle">✦</div>
            <div>
              <h2>Find your next project</h2>
              <p>Choose your preferences to explore project ideas.</p>
            </div>
          </div>

          <div className="generator-filters">
            <label>
              Technology
              <select value={technology} onChange={(event) => setTechnology(event.target.value)}>
                {techOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categoryOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label>
              Difficulty
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                {levelOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <button className="feature-primary-btn generator-button" onClick={generateProjects}>
            ✦ Generate Project Ideas
          </button>
        </section>

        <div className="project-results-heading">
          <div>
            <span className="feature-label">YOUR PROJECT COLLECTION</span>
            <h2>{generated ? "Your matching projects" : "Explore project ideas"}</h2>
            <p>
              {generated
                ? `${results.length} project idea${results.length === 1 ? "" : "s"} match your selected filters.`
                : "Choose your preferences and generate a personalised shortlist."}
            </p>
          </div>
          <span className="project-result-count">{results.length} ideas</span>
        </div>

        {results.length > 0 ? (
          <section className="project-card-grid">
            {results.map((project) => (
              <article className="project-idea-card" key={project.title}>
                <div className="project-card-top">
                  <span className="project-card-icon">✦</span>
                  <span className={`project-level ${project.level.toLowerCase()}`}>
                    {project.level}
                  </span>
                </div>

                <span className="project-category">{project.category}</span>
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-tech-list">
                  {project.technologies.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>

                <button
                  className="project-details-btn"
                  onClick={() => setSelectedProject(project)}
                >
                  View Project Plan <span>→</span>
                </button>
              </article>
            ))}
          </section>
        ) : (
          <section className="feature-card project-empty">
            <span>🔎</span>
            <h3>No exact matches found</h3>
            <p>Try a different technology, category or difficulty level.</p>
            <button
              className="feature-outline-btn"
              onClick={() => {
                setTechnology("All");
                setCategory("All");
                setLevel("All");
                setGenerated(false);
              }}
            >
              Reset Filters
            </button>
          </section>
        )}

        {selectedProject && (
          <section className="feature-card project-plan">
            <div className="project-plan-heading">
              <div>
                <span className="feature-label">PROJECT BLUEPRINT</span>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>
              </div>
              <button
                className="project-close-btn"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project plan"
              >
                ×
              </button>
            </div>

            <div className="project-plan-columns">
              <div>
                <h3>Core features</h3>
                <ul>
                  {selectedProject.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Suggested build order</h3>
                <ol>
                  {selectedProject.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <p className="project-plan-note">
              These are curated starter ideas, not live AI-generated results.
              You can use this plan to start building and later add AI features.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default ProjectGenerator;

