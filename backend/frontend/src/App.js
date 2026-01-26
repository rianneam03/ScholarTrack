import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Components ---
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Sessions from "./components/Sessions";
import Attendance from "./components/Attendance";
import Login from "./components/Login";
import AdminUsers from "./components/AdminUsers";
import ActivateAccount from "./components/ActivateAccount";

// --- Private Route Wrapper ---
function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !allowedRoles.includes(user.role)) {
    return <Login />; // redirect to login if not authorized
  }
  return children;
}

function App() {
  return (
    <Router>
      <Navbar />

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
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </PrivateRoute>
          }
        />

        {/* ----------------- Teacher/Admin Routes ----------------- */}
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
      </Routes>
    </Router>
  );
}

export default App;
