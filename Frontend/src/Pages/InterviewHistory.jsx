
import { useEffect, useMemo, useState } from "react";

export default function InterviewHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("jobmate_token");

      if (!token) {
        if (!cancelled) {
          setError("Please log in to view your interview history.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/interview/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load interview history."
          );
        }

        if (!cancelled) {
          setHistory(Array.isArray(data.history) ? data.history : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ==========================================
  // THEME STYLES
  // ==========================================

  const pageStyle = {
    minHeight: "100vh",
    padding: "36px 24px",
    color: "#f8fafc",
    background:
      "linear-gradient(135deg, #111126 0%, #21143c 55%, #301436 100%)",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
  };

  const smallLabelStyle = {
    color: "#b8b4cb",
    fontSize: "14px",
    marginBottom: "9px",
  };

  // ==========================================
  // ROLE FILTER
  // ==========================================

  const filteredHistory = useMemo(() => {
    if (roleFilter === "All Roles") {
      return history;
    }

    return history.filter(
      (item) => item.target_role === roleFilter
    );
  }, [history, roleFilter]);

  // ==========================================
  // PERFORMANCE ANALYTICS
  // ==========================================

  const analytics = useMemo(() => {
    const scores = filteredHistory.map((item) =>
      Number(item.score) || 0
    );

    const total = scores.length;

    if (total === 0) {
      return {
        total: 0,
        average: 0,
        best: 0,
        latest: 0,
        difference: null,
      };
    }

    const average = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / total
    );

    const best = Math.max(...scores);

    const chronological = [...filteredHistory].reverse();

    const latest =
      Number(chronological[total - 1].score) || 0;

    const previous =
      total > 1
        ? Number(chronological[total - 2].score) || 0
        : null;

    return {
      total,
      average,
      best,
      latest,
      difference:
        previous === null ? null : latest - previous,
    };
  }, [filteredHistory]);

  const chartData = useMemo(() => {
    return [...filteredHistory].reverse().slice(-8);
  }, [filteredHistory]);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const getDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  const getShortDate = (dateValue, index) => {
    if (!dateValue) return `Attempt ${index + 1}`;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return `Attempt ${index + 1}`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#86efac";
    if (score >= 60) return "#fcd34d";
    return "#fda4af";
  };

  // ==========================================
  // PDF REPORT DOWNLOAD
  // ==========================================

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const handleDownloadReport = (item) => {
    const evaluation = item.evaluation || {};

    const makeList = (items) => {
      if (!Array.isArray(items) || items.length === 0) {
        return "<p>Not available</p>";
      }

      return `<ul>${items
        .map((text) => `<li>${escapeHtml(text)}</li>`)
        .join("")}</ul>`;
    };

    const report = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>JobMate AI Interview Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #222;
            padding: 35px;
            line-height: 1.6;
          }

          h1 {
            color: #54218a;
          }

          h2 {
            color: #54218a;
            border-bottom: 1px solid #ddd;
            padding-bottom: 6px;
          }

          .score {
            font-size: 32px;
            font-weight: bold;
            color: #54218a;
          }

          .section {
            margin-top: 25px;
            page-break-inside: avoid;
          }

          li {
            margin-bottom: 8px;
          }

          @media print {
            body {
              padding: 15px;
            }
          }
        </style>
      </head>

      <body>
        <h1>JobMate AI</h1>
        <h2>Interview Performance Report</h2>

        <p>
          <strong>Role:</strong>
          ${escapeHtml(item.target_role)}
        </p>

        <p>
          <strong>Date:</strong>
          ${escapeHtml(getDate(item.created_at))}
        </p>

        <p class="score">
          Score: ${escapeHtml(item.score)}/100
        </p>

        <div class="section">
          <h2>Interview Question</h2>
          <p>${escapeHtml(item.question)}</p>
        </div>

        <div class="section">
          <h2>Candidate Answer</h2>
          <p>${escapeHtml(item.answer)}</p>
        </div>

        <div class="section">
          <h2>AI Feedback</h2>
          <p>${escapeHtml(evaluation.message)}</p>
        </div>

        <div class="section">
          <h2>Strengths</h2>
          ${makeList(evaluation.strengths)}
        </div>

        <div class="section">
          <h2>Areas to Improve</h2>
          ${makeList(evaluation.improvements)}
        </div>

        <div class="section">
          <h2>Sample Answer</h2>
          <p>${escapeHtml(evaluation.sample_answer)}</p>
        </div>

        <p style="margin-top:40px;color:#777">
          Generated by JobMate AI
        </p>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      alert("Please allow pop-ups to download your report.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(report);
    reportWindow.document.close();
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2>Loading interview analytics...</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* PAGE HEADING */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "#c084fc",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              YOUR PROGRESS
            </p>

            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                margin: "8px 0",
              }}
            >
              Interview History
            </h1>

            <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Track your interview scores and improve your performance
              with AI-powered feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(216,180,254,0.35)",
              background: "rgba(192,132,252,0.15)",
              color: "#e9d5ff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ↻ Refresh History
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div style={cardStyle}>
            <p style={{ color: "#fda4af" }}>{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && history.length === 0 && (
          <div style={cardStyle}>
            <h2>No interviews yet</h2>

            <p style={{ color: "#cbd5e1" }}>
              Complete an Interview Practice session to see your
              scores and performance analytics here.
            </p>
          </div>
        )}

        {!error && history.length > 0 && (
          <>
            {/* ROLE FILTER */}

            <div
              style={{
                ...cardStyle,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px" }}>
                  Performance Overview
                </h3>

                <p style={{ ...smallLabelStyle, margin: 0 }}>
                  Filter your interview attempts by target role.
                </p>
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#302044",
                  color: "#fff",
                  border: "1px solid rgba(216,180,254,0.35)",
                  outline: "none",
                  minWidth: "190px",
                  cursor: "pointer",
                }}
              >
                <option value="All Roles">All Roles</option>
                <option value="Python Developer">
                  Python Developer
                </option>
                <option value="Frontend Developer">
                  Frontend Developer
                </option>
                <option value="Data Analyst">
                  Data Analyst
                </option>
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <div style={cardStyle}>
                <h3>No attempts for this role</h3>

                <p style={{ color: "#cbd5e1" }}>
                  Select another role to view its interview records.
                </p>
              </div>
            ) : (
              <>
                {/* ANALYTICS CARDS */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "16px",
                    marginBottom: "18px",
                  }}
                >
                  {[
                    {
                      label: "Total Attempts",
                      value: analytics.total,
                      icon: "🎯",
                    },
                    {
                      label: "Average Score",
                      value: `${analytics.average}/100`,
                      icon: "📊",
                    },
                    {
                      label: "Highest Score",
                      value: `${analytics.best}/100`,
                      icon: "🏆",
                    },
                    {
                      label: "Latest Score",
                      value: `${analytics.latest}/100`,
                      icon: "⚡",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        ...cardStyle,
                        marginBottom: 0,
                      }}
                    >
                      <p style={{ fontSize: "23px", margin: "0 0 12px" }}>
                        {stat.icon}
                      </p>

                      <p style={smallLabelStyle}>
                        {stat.label}
                      </p>

                      <h2
                        style={{
                          margin: 0,
                          fontSize: "27px",
                          color: "#d8b4fe",
                        }}
                      >
                        {stat.value}
                      </h2>
                    </div>
                  ))}
                </div>

                {/* RECENT PERFORMANCE */}

                {analytics.difference !== null && (
                  <div style={cardStyle}>
                    <h3 style={{ marginTop: 0 }}>
                      Recent Performance
                    </h3>

                    <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                      Your latest score is{" "}
                      <strong
                        style={{
                          color:
                            analytics.difference > 0
                              ? "#86efac"
                              : analytics.difference < 0
                              ? "#fda4af"
                              : "#fcd34d",
                        }}
                      >
                        {analytics.difference > 0
                          ? `up by ${analytics.difference} points`
                          : analytics.difference < 0
                          ? `down by ${Math.abs(analytics.difference)} points`
                          : "unchanged"}
                      </strong>{" "}
                      compared with your previous attempt.
                    </p>
                  </div>
                )}

                {/* PERFORMANCE CHART */}

                <div style={cardStyle}>
                  <h2 style={{ marginTop: 0 }}>
                    Score Performance
                  </h2>

                  <p style={{ ...smallLabelStyle, lineHeight: 1.6 }}>
                    Your latest {chartData.length} attempts.
                    Each bar represents one interview score.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "clamp(10px, 3vw, 25px)",
                      minHeight: "230px",
                      padding: "20px 8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      overflowX: "auto",
                    }}
                  >
                    {chartData.map((item, index) => {
                      const score = Math.max(
                        0,
                        Math.min(100, Number(item.score) || 0)
                      );

                      return (
                        <div
                          key={item.id}
                          style={{
                            flex: "1 0 48px",
                            maxWidth: "100px",
                            textAlign: "center",
                            minWidth: 0,
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 8px",
                              color: getScoreColor(score),
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            {score}
                          </p>

                          <div
                            style={{
                              height: "170px",
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              title={`${score}/100`}
                              style={{
                                width: "65%",
                                minHeight: "5px",
                                height: `${Math.max(score, 3)}%`,
                                maxWidth: "55px",
                                borderRadius: "9px 9px 0 0",
                                background:
                                  "linear-gradient(180deg, #c084fc, #7c3aed)",
                                boxShadow:
                                  "0 0 15px rgba(168,85,247,0.25)",
                                transition: "height 0.4s ease",
                              }}
                            />
                          </div>

                          <p
                            style={{
                              color: "#cbd5e1",
                              fontSize: "11px",
                              margin: "9px 0 12px",
                            }}
                          >
                            {getShortDate(item.created_at, index)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INTERVIEW RECORDS */}

                <h2 style={{ margin: "32px 0 18px" }}>
                  Previous Interview Attempts
                </h2>

                {filteredHistory.map((item) => {
                  const evaluation = item.evaluation || {};
                  const score = Number(item.score) || 0;

                  return (
                    <article
                      key={item.id}
                      style={cardStyle}
                    >
                      {/* ROLE, DATE, SCORE AND PDF BUTTON */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "14px",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              marginTop: 0,
                              marginBottom: "8px",
                            }}
                          >
                            {item.target_role}
                          </h2>

                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                            }}
                          >
                            {getDate(item.created_at)}
                          </p>
                        </div>

                        {/* SCORE AND DOWNLOAD BUTTON */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              borderRadius: "12px",
                              padding: "12px 18px",
                              background: "rgba(192,132,252,0.14)",
                              color: getScoreColor(score),
                              fontWeight: "bold",
                              fontSize: "22px",
                            }}
                          >
                            {score}/100
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadReport(item)}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "none",
                              background:
                                "linear-gradient(135deg, #9333ea, #c026d3)",
                              color: "#fff",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            ⬇ Download PDF
                          </button>
                        </div>
                      </div>

                      {/* INTERVIEW QUESTION */}

                      <h3>Interview Question</h3>

                      <p style={{ color: "#e2e8f0", lineHeight: 1.7 }}>
                        {item.question}
                      </p>

                      {/* CANDIDATE ANSWER */}

                      <h3>Your Answer</h3>

                      <p
                        style={{
                          color: "#cbd5e1",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.answer}
                      </p>

                      {/* AI FEEDBACK */}

                      {evaluation.message && (
                        <>
                          <h3>AI Feedback</h3>

                          <p
                            style={{
                              color: "#cbd5e1",
                              lineHeight: 1.7,
                            }}
                          >
                            {evaluation.message}
                          </p>
                        </>
                      )}

                      {/* STRENGTHS */}

                      {Array.isArray(evaluation.strengths) &&
                        evaluation.strengths.length > 0 && (
                          <>
                            <h3 style={{ color: "#86efac" }}>
                              Strengths
                            </h3>

                            {evaluation.strengths.map((text, index) => (
                              <p
                                key={index}
                                style={{ color: "#d1fae5" }}
                              >
                                ✓ {text}
                              </p>
                            ))}
                          </>
                        )}

                      {/* IMPROVEMENTS */}

                      {Array.isArray(evaluation.improvements) &&
                        evaluation.improvements.length > 0 && (
                          <>
                            <h3 style={{ color: "#fcd34d" }}>
                              Areas to Improve
                            </h3>

                            {evaluation.improvements.map((text, index) => (
                              <p
                                key={index}
                                style={{ color: "#fef3c7" }}
                              >
                                • {text}
                              </p>
                            ))}
                          </>
                        )}

                      {/* SAMPLE ANSWER */}

                      {evaluation.sample_answer && (
                        <details style={{ marginTop: "18px" }}>
                          <summary
                            style={{
                              cursor: "pointer",
                              color: "#d8b4fe",
                              fontWeight: "bold",
                            }}
                          >
                            View Sample Answer
                          </summary>

                          <p
                            style={{
                              color: "#e2e8f0",
                              lineHeight: 1.8,
                              marginTop: "12px",
                            }}
                          >
                            {evaluation.sample_answer}
                          </p>
                        </details>
                      )}
                    </article>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
