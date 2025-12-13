import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Sessions from "./components/Sessions";
import Attendance from "./components/Attendance";
import Login from "./components/Login";

// 🔒 Simple private route wrapper
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
        {/* 🔒 Dashboard is now protected */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={["admin", "teacher", "donor"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Public login route */}
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "teacher", "donor"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />


        {/* Restricted routes */}
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
