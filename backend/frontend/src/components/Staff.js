import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../apiConfig";

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = { Username: currentUser?.username };
        const res = await axios.get(`${API_BASE}/users/`, { headers });
        // Filter for staff roles
        setUsers(res.data.filter(u => u.role === "admin" || u.role === "teacher"));
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  if (loading) return <div className="page-container">Loading Staff Directory...</div>;

  return (
    <div className="page-container transition-fade">
      <div className="dashboard-header">
        <h2>Staff Directory</h2>
        <p className="helper-text">Overview of all administrators and instructors.</p>
      </div>

      <div className="card glass-card shadow-lg" style={{ marginTop: "25px" }}>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((staff) => (
              <tr key={staff.userid || staff.username}>
                <td style={{ fontWeight: "600", color: "var(--navy)" }}>{staff.fullname}</td>
                <td>{staff.username}</td>
                <td>
                  <span className={`status-badge ${staff.role}`} style={{ 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontSize: "0.75rem", 
                    fontWeight: "700",
                    background: staff.role === "admin" ? "var(--teal-soft)" : "var(--bg-muted)",
                    color: staff.role === "admin" ? "var(--teal)" : "var(--text-secondary)"
                  }}>
                    {staff.role.toUpperCase()}
                  </span>
                </td>
                <td>{staff.email || "N/A"}</td>
                <td>{staff.phone || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
