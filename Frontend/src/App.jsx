
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Jobs from "./Pages/Jobs";
import ResumeAnalyzer from "./Pages/ResumeAnalyzer";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import InterviewPractice from "./Pages/InterviewPractice";
import InterviewHistory from "./Pages/InterviewHistory";
import ProjectGenerator from "./Pages/ProjectGenerator";
import Profile from "./Pages/Profile";
import Admin from "./Pages/Admin";
import AdminRoute from "./AdminRoute";
import SavedJobs from "./Pages/SavedJobs";
import Settings from "./Pages/Settings";
import CareerRoadmap from "./Pages/CareerRoadmap";
import Applications from "./Pages/Applications";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/jobs" element={<Jobs />} />

          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route
            path="/career-roadmap"
            element={
              <ProtectedRoute>
                <CareerRoadmap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-analyzer"
            element={<ResumeAnalyzer />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-practice"
            element={<InterviewPractice />}
          />

          <Route
            path="/interview-history"
            element={
              <ProtectedRoute>
                <InterviewHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project-generator"
            element={<ProjectGenerator />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
