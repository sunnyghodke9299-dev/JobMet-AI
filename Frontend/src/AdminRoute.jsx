
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("jobmate_token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("jobmate_user") || "null"
    );
  } catch {
    user = null;
  }

  // Login nahi hai to Login page par bhejo
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normal user ko Admin page access nahi milega
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin hai to requested page dikhao
  return children;
}

export default AdminRoute;
