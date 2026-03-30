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

      {user && (
        <div className="navbar-user-top">
          <span className="navbar-user-name">Hi, {user.fullname || user.username}</span>
          <span className="navbar-user-role">{role}</span>
        </div>
      )}

      {user ? (
        <>
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              <div className="nav-icon-wrapper" style={{background: '#E0F2FE'}}>📊</div>
              <span className="nav-text">Overview</span>
            </NavLink>

            <NavLink to="/programs" className={({ isActive }) => (isActive ? "active" : "")}>
              <div className="nav-icon-wrapper" style={{background: '#0D9488'}}>📁</div>
              <span className="nav-text">Programs</span>
            </NavLink>

            <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
              <div className="nav-icon-wrapper" style={{background: '#065F46'}}>🎓</div>
              <span className="nav-text">Students</span>
            </NavLink>

            <NavLink to="/attendance" className={({ isActive }) => (isActive ? "active" : "")}>
              <div className="nav-icon-wrapper" style={{background: '#14B8A6'}}>📋</div>
              <span className="nav-text">Attendance</span>
            </NavLink>

            {(role === "admin" || role === "teacher") && (
              <NavLink to="/staff" className={({ isActive }) => (isActive ? "active" : "")}>
                <div className="nav-icon-wrapper" style={{background: '#6366F1'}}>👔</div>
                <span className="nav-text">Staff</span>
              </NavLink>
            )}

            {role === "admin" && (
              <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active" : "")}>
                <div className="nav-icon-wrapper" style={{background: '#F1F5F9'}}>⚙️</div>
                <span className="nav-text">Settings</span>
              </NavLink>
            )}

            {(role === "parent" || role === "admin") && (
              <NavLink to="/parent-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                <div className="nav-icon-wrapper" style={{background: '#FEF9C3'}}>👪</div>
                <span className="nav-text">Parent Portal</span>
              </NavLink>
            )}
          </div>

          <div className="navbar-footer" style={{marginTop: 'auto'}}>
            <button className="navbar-logout" onClick={handleLogout} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', padding: '12px 14px'}}>
              <div className="nav-icon-wrapper" style={{background: 'rgba(255,255,255,0.1)', filter: 'none'}}>↳</div>
              <span className="nav-text" style={{fontWeight: 600}}>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-links">
          <NavLink to="/login">
            <div className="nav-icon-wrapper" style={{background: '#E0F2FE'}}>🔑</div>
            <span className="nav-text">Login</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
