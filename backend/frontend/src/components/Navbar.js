import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const [user, setUser] = useState(null);
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
    <nav className="navbar">
      <div className="navbar a">ScholarTrack</div>

      <div className="navbar-links">
        {user ? (
          <>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>

            {(role === "admin" || role === "teacher") && (
              <>
                <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
                  Students
                </NavLink>
                <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active" : "")}>
                  Sessions
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => (isActive ? "active" : "")}>
                  Attendance
                </NavLink>
              </>
            )}

            <span className="navbar-user">
              Hi, {user.fullname || user.username} ({role})
            </span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
