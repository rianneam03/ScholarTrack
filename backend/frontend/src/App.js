import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- Components ---
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Sessions from "./components/Sessions";
import Schools from "./components/Schools";
import Attendance from "./components/Attendance";
import Login from "./components/Login";
import AdminUsers from "./components/AdminUsers";
import ActivateAccount from "./components/ActivateAccount";
import ParentDashboard from "./components/ParentDashboard";
import Programs from "./components/Programs";
import ProgramDashboard from "./components/ProgramDashboard";
import Guardians from "./components/Guardians";

// --- Private Route Wrapper ---
function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // User must exist, be active, and have allowed role
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <div className="main-content">
          <Routes>
            {/* ----------------- Public Routes ----------------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/activate" element={<ActivateAccount />} />

            {/* ----------------- Dashboard ----------------- */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher", "donor"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher", "donor"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* ----------------- Admin Routes ----------------- */}
            <Route
              path="/programs"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher"]}>
                  <Programs />
                </PrivateRoute>
              }
            />
            <Route
              path="/guardians"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Guardians />
                </PrivateRoute>
              }
            />
            <Route
              path="/guardians"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Guardians />
                </PrivateRoute>
              }
            />
            <Route
              path="/schools"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Schools />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />

            {/* ----------------- Parent Routes ----------------- */}
            <Route
              path="/parent-dashboard"
              element={
                <PrivateRoute allowedRoles={["admin", "parent"]}>
                  <ParentDashboard />
                </PrivateRoute>
              }
            />

            {/* ----------------- Teacher/Admin Routes ----------------- */}
            <Route
              path="/programs/:programYearId"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher"]}>
                  <ProgramDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher"]}>
                  <Students />
                </PrivateRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher"]}>
                  <Sessions />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute allowedRoles={["admin", "teacher"]}>
                  <Attendance />
                </PrivateRoute>
              }
            />

            {/* ----------------- Catch-all for unknown routes ----------------- */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
