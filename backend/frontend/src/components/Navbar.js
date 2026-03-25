import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    window.addEventListener("storage", () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    });
  }, []);

  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="navbar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? "☰" : "⨉"}
      </button>
      <div className="navbar-brand">
        <img src="/logo.png" alt="Education for Scholars" className="navbar-logo" />
        <span className="navbar-brand-text">ScholarTrack</span>
      </div>

      {user ? (
        <>
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-icon">📊</span> <span className="nav-text">Dashboard</span>
            </NavLink>

            {(role === "admin" || role === "teacher") && (
              <>
                <NavLink to="/programs" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">📚</span> <span className="nav-text">Programs</span>
                </NavLink>
                <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">👨‍🎓</span> <span className="nav-text">Students</span>
                </NavLink>
                <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">📅</span> <span className="nav-text">Sessions</span>
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">✅</span> <span className="nav-text">Attendance</span>
                </NavLink>
              </>
            )}

            {role === "admin" && (
              <>
                <NavLink to="/schools" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">🏫</span> <span className="nav-text">Schools</span>
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">⚙️</span> <span className="nav-text">Manage Users</span>
                </NavLink>
              </>
            )}

            {(role === "parent" || role === "admin") && (
              <>
                <NavLink to="/parent-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-icon">👪</span> <span className="nav-text">Parent Portal</span>
                </NavLink>
              </>
            )}
          </div>

          <div className="navbar-user-section">
            <span className="navbar-user">
              <span className="nav-text">Hi, {user.fullname || user.username} ({role})</span>
              <span className="nav-icon">👤</span>
            </span>
            <button className="navbar-logout" onClick={handleLogout}>
              <span className="nav-text">Logout</span>
              <span className="nav-icon" style={{display: "none"}}>🚪</span>
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-links">
          <NavLink to="/login">
            <span className="nav-icon">🔑</span> <span className="nav-text">Login</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
