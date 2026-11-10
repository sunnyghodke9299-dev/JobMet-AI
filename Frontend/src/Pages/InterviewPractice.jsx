import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

const questionBank = {
  "Python Developer": [
    {
      question: "What is the difference between a list and a tuple in Python?",
      hints: ["mutable", "immutable", "change"],
      sample:
        "A list is mutable, so its elements can be changed after creation. A tuple is immutable, so its elements cannot be changed after creation. Lists use square brackets and tuples commonly use parentheses.",
    },
    {
      question: "What is a Python dictionary?",
      hints: ["key", "value", "mapping"],
      sample:
        "A dictionary stores data as key-value pairs. Keys are unique and are used to access their corresponding values. Dictionaries are mutable.",
    },
    {
      question: "What is exception handling in Python?",
      hints: ["try", "except", "error"],
      sample:
        "Exception handling manages runtime errors using try and except blocks. The else block can run when no exception occurs, and finally can run whether an exception occurs or not.",
    },
  ],

  "Frontend Developer": [
    {
      question: "What is the difference between let, const and var in JavaScript?",
      hints: ["scope", "reassign", "block"],
      sample:
        "Var is function-scoped, while let and const are block-scoped. A let variable can be reassigned. A const binding cannot be reassigned, although objects declared with const can still be mutated.",
    },
    {
      question: "What are React props and state?",
      hints: ["component", "data", "update"],
      sample:
        "Props pass data from a parent component to a child component. State stores data managed by a component, and updating state can cause React to render the component again.",
    },
    {
      question: "What is the purpose of useEffect in React?",
      hints: ["effect", "render", "dependency"],
      sample:
        "useEffect lets a component synchronize with external systems, such as fetching data or setting up subscriptions. Its dependency array determines when the effect runs again.",
    },
  ],

  "Data Analyst": [
    {
      question: "What is the difference between WHERE and HAVING in SQL?",
      hints: ["rows", "group", "aggregate"],
      sample:
        "WHERE filters rows before grouping. HAVING filters groups after GROUP BY and is commonly used with aggregate conditions.",
    },
    {
      question: "What is the difference between INNER JOIN and LEFT JOIN?",
      hints: ["matching", "rows", "null"],
      sample:
        "INNER JOIN returns rows with matching values in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right, with NULL values when there is no match.",
    },
    {
      question: "How do you handle missing values in a dataset?",
      hints: ["missing", "null", "impute"],
      sample:
        "First, measure the amount and pattern of missing data. Depending on the context, missing values may be removed, imputed with appropriate statistics, or handled using a domain-specific method.",
    },
  ],
};

function InterviewPractice() {
  const [role, setRole] = useState("Python Developer");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  const questions = questionBank[role];
  const current = questions[index];

  const wordCount = answer.trim()
    ? answer.trim().split(/\s+/).length
    : 0;

  const changeRole = (event) => {
    setRole(event.target.value);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setCompleted([]);
  };

  // =====================================
  // AI-POWERED ANSWER EVALUATION
  // =====================================

  const evaluateAnswer = async () => {
    if (wordCount < 5) {
      setFeedback({
        type: "error",
        title: "Add more detail",
        message:
          "Write at least 5 words explaining your answer. Try defining the concept and giving an example.",
        strengths: [],
        tips: [],
        sampleAnswer: current.sample,
      });
      return;
    }

    const token = localStorage.getItem("jobmate_token");

    if (!token) {
      setFeedback({
        type: "error",
        title: "Login required",
        message:
          "Please log in to your JobMate AI account before evaluating answers.",
        strengths: [],
        tips: [],
        sampleAnswer: current.sample,
      });
      return;
    }

    if (evaluating) return;

    setEvaluating(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/interview/evaluate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target_role: role,
            question: current.question,
            answer: answer.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not evaluate your answer."
        );
      }

      const result =
        data.evaluation || data.feedback || data;

      const parsedScore = Number(result.score);

      if (
        !Number.isFinite(parsedScore) ||
        parsedScore < 0 ||
        parsedScore > 100
      ) {
        throw new Error(
          "The AI returned an invalid score. Please try again."
        );
      }

      const strengths = Array.isArray(result.strengths)
        ? result.strengths.filter(
            (item) => typeof item === "string" && item.trim()
          )
        : [];

      const improvementItems = Array.isArray(result.improvements)
        ? result.improvements
        : Array.isArray(result.tips)
          ? result.tips
          : [];

      const tips = improvementItems.filter(
        (item) => typeof item === "string" && item.trim()
      );

      setFeedback({
        type: "result",
        title:
          parsedScore >= 80
            ? "Excellent answer!"
            : parsedScore >= 60
              ? "Good effort!"
              : "There is room to improve",
        message:
          result.message ||
          data.message ||
          "AI feedback generated from your answer.",
        score: Math.round(parsedScore),
        strengths,
        tips,
        sampleAnswer:
          typeof result.sample_answer === "string" &&
          result.sample_answer.trim()
            ? result.sample_answer
            : current.sample,
      });

      setCompleted((previous) =>
        previous.includes(index)
          ? previous
          : [...previous, index]
      );
    } catch (error) {
      setFeedback({
        type: "error",
        title: "Evaluation failed",
        message:
          error.message ||
          "Could not connect to the interview evaluation service.",
        strengths: [],
        tips: [],
        sampleAnswer: current.sample,
      });
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setIndex((previous) => (previous + 1) % questions.length);
    setAnswer("");
    setFeedback(null);
  };

  return (
    <main className="feature-page">
      <div className="feature-container">
        {/* Hero */}
        <header className="feature-hero">
          <span className="feature-eyebrow">
            ✦ INTERVIEW PREPARATION STUDIO
          </span>

          <h1>
            Practice with <span>confidence.</span>
          </h1>

          <p>
            Prepare for technical interviews, organise your thoughts
            and build the confidence to explain what you know.
          </p>
        </header>

        <section className="interview-layout">
          {/* Sidebar */}
          <aside className="feature-card interview-sidebar">
            <span className="feature-label">
              YOUR PRACTICE SESSION
            </span>

            <h2>Choose your role</h2>

            <label
              className="feature-field-label"
              htmlFor="interview-role"
            >
              Interview role
            </label>

            <select
              id="interview-role"
              value={role}
              disabled={evaluating}
              onChange={changeRole}
            >
              {Object.keys(questionBank).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="session-progress-heading">
              <span>Session progress</span>
              <strong>
                {completed.length}/{questions.length}
              </strong>
            </div>

            <div className="feature-progress">
              <div
                style={{
                  width: `${
                    (completed.length / questions.length) * 100
                  }%`,
                }}
              />
            </div>

            <div className="interview-question-list">
              {questions.map((item, questionIndex) => (
                <button
                  type="button"
                  key={item.question}
                  className={`interview-question-link ${
                    index === questionIndex ? "selected" : ""
                  }`}
                  disabled={evaluating}
                  onClick={() => {
                    setIndex(questionIndex);
                    setAnswer("");
                    setFeedback(null);
                  }}
                >
                  <span className="question-number">
                    {completed.includes(questionIndex)
                      ? "✓"
                      : `0${questionIndex + 1}`}
                  </span>

                  <span>{item.question}</span>
                </button>
              ))}
            </div>

            <div className="interview-tip">
              <span>💡</span>
              <p>
                Tip: Explain the concept first, then support your
                answer with a practical example.
              </p>
            </div>
          </aside>

          {/* Interview workspace */}
          <section className="feature-card interview-workspace">
            <div className="workspace-topline">
              <span className="question-category">
                TECHNICAL QUESTION
              </span>

              <span className="question-counter">
                Question {index + 1} of {questions.length}
              </span>
            </div>

            <h2>{current.question}</h2>

            <p className="question-instruction">
              Take your time. Write your answer as if you were
              explaining it to an interviewer.
            </p>

            <label
              className="feature-field-label"
              htmlFor="interview-answer"
            >
              Your answer
            </label>

            <textarea
              id="interview-answer"
              className="interview-answer-input"
              value={answer}
              disabled={evaluating}
              onChange={(event) => {
                setAnswer(event.target.value);
                setFeedback(null);
              }}
              placeholder="Start writing your answer here. Explain the concept, how it works, and give an example."
              rows={8}
            />

            <div className="answer-footer">
              <span>{wordCount} words</span>

              <button
                type="button"
                className="feature-primary-btn"
                disabled={evaluating}
                onClick={evaluateAnswer}
              >
                {evaluating
                  ? "AI is reviewing..."
                  : "Review My Answer"}

                {!evaluating && <span> →</span>}
              </button>
            </div>

            {feedback && (
              <div
                className={`answer-feedback ${feedback.type}`}
                role="status"
              >
                <h3>{feedback.title}</h3>
                <p>{feedback.message}</p>

                {feedback.score !== undefined && (
                  <div className="practice-score">
                    <strong>{feedback.score}%</strong>
                    <span>AI practice score</span>
                  </div>
                )}

                {feedback.strengths?.length > 0 && (
                  <>
                    <h4>What went well</h4>
                    <ul>
                      {feedback.strengths.map((item, itemIndex) => (
                        <li key={`${itemIndex}-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {feedback.tips?.length > 0 && (
                  <>
                    <h4>How to improve</h4>
                    <ul>
                      {feedback.tips.map((tip, itemIndex) => (
                        <li key={`${itemIndex}-${tip}`}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {feedback.sampleAnswer && (
                  <div className="sample-answer">
                    <h4>Sample answer to learn from</h4>
                    <p>{feedback.sampleAnswer}</p>
                  </div>
                )}
              </div>
            )}

            <div className="interview-bottom">
              <span>
                ✦ Keep learning. Every answer is progress.
              </span>

              <button
                type="button"
                className="feature-outline-btn"
                disabled={evaluating}
                onClick={nextQuestion}
              >
                Next Question →
              </button>
            </div>

            <p style={{ marginTop: "16px", fontSize: "12px" }}>
              AI feedback is practice guidance, not a guarantee of
              interview performance or employment.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}

export default InterviewPractice;