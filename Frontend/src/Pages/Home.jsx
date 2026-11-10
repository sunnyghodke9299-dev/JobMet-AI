import { useRef, useState } from "react";

function Home() {
  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="home">

      {/* ================= HERO ================= */}

      <main className="hero">

        <div className="hero-content">

          <p className="tagline">
            AI-POWERED CAREER PLATFORM
          </p>

          <h1>
            Build Your Career
            <br />
            <span>Smarter with AI.</span>
          </h1>

          <p className="description">
            Analyze your resume, discover matching jobs, identify skill gaps,
            and get a personalized career roadmap with JobMate AI.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn">
              Analyze My Resume
            </button>

            <button className="secondary-btn">
              Explore Jobs
            </button>

          </div>

        </div>

        {/* CAREER READINESS CARD */}

        <div className="hero-card">

          <div className="card-header">
            <span>Career Readiness</span>
            <span className="score">82%</span>
          </div>

          <div className="progress">
            <div className="progress-bar"></div>
          </div>

          <div className="skills">

            <div>
              <span>Python</span>
              <b>90%</b>
            </div>

            <div>
              <span>React.js</span>
              <b>78%</b>
            </div>

            <div>
              <span>SQL</span>
              <b>85%</b>
            </div>

          </div>

          <div className="ai-message">

            🤖 AI Suggestion

            <p>
              Improve your Data Structures & Algorithms skills to unlock more
              job opportunities.
            </p>

          </div>

        </div>

      </main>


      {/* ================= AI VIDEO ================= */}

      <section className="ai-video-section">

        <div className="video-heading">

          <p className="tagline">
            YOUR AI CAREER ASSISTANT
          </p>

          <h2>
            Meet Your <span>AI Career Assistant</span>
          </h2>

          <p>
            Discover how JobMate AI can help you analyze your resume,
            find matching jobs, identify skill gaps, and build your
            personalized career roadmap.
          </p>

        </div>


        <div className="video-container">

          <video
            ref={videoRef}
            className="career-video"
            muted
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source
              src="/jobmate-intro.mp4"
              type="video/mp4"
            />

            Your browser does not support the video tag.
          </video>


          {/* VIDEO OVERLAY */}

          <div className="video-overlay">

            <div className="video-controls">

              <button
                className="video-control-btn"
                onClick={togglePlay}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>


              <button
                className="video-control-btn"
                onClick={toggleMute}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>

            </div>

          </div>

        </div>


        {/* VIDEO INFO CARDS */}

        <div className="video-highlights">

          <div className="video-highlight">
            <div>📄</div>
            <span>Resume Analysis</span>
          </div>

          <div className="video-highlight">
            <div>🎯</div>
            <span>Smart Job Matching</span>
          </div>

          <div className="video-highlight">
            <div>🧠</div>
            <span>Skill Gap Analysis</span>
          </div>

          <div className="video-highlight">
            <div>🚀</div>
            <span>Career Roadmap</span>
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="features">

        <h2>
          Everything You Need to Grow Your Career
        </h2>

        <div className="feature-grid">

          <div className="feature-card">

            <div className="icon">📄</div>

            <h3>
              Resume Analyzer
            </h3>

            <p>
              Get AI-powered feedback on your resume and discover areas
              for improvement.
            </p>

          </div>


          <div className="feature-card">

            <div className="icon">🎯</div>

            <h3>
              Smart Job Matching
            </h3>

            <p>
              Find jobs that match your skills, experience, and career goals.
            </p>

          </div>


          <div className="feature-card">

            <div className="icon">🧠</div>

            <h3>
              Skill Gap Analysis
            </h3>

            <p>
              Understand which skills you need to develop for your target
              career.
            </p>

          </div>


          <div className="feature-card">

            <div className="icon">🚀</div>

            <h3>
              AI Career Roadmap
            </h3>

            <p>
              Follow a personalized learning roadmap designed around your
              career goal.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;