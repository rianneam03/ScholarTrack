import React from "react";
import { Link } from "react-router-dom";

export default function AdminSettings() {
  const adminLinks = [
    { title: "School Management", desc: "Manage school sites and information", path: "/schools", icon: "🏫" },
    { title: "Guardian Directory", desc: "View and link guardians to students", path: "/guardians", icon: "🛡️" },
    { title: "User Management", desc: "Create and manage system user accounts", path: "/admin/users", icon: "👤" },
  ];

  return (
    <div className="page-container transition-fade">
      <div className="dashboard-header">
        <h2>Admin Settings & Tools</h2>
        <p className="helper-text">Centralized management for system-wide configurations.</p>
      </div>

      <div className="program-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px", marginTop: "30px" }}>
        {adminLinks.map((link) => (
          <Link key={link.path} to={link.path} style={{ textDecoration: "none" }}>
            <div className="card glass-card hover-scale transition-all" style={{ padding: "25px", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "2rem" }}>{link.icon}</div>
              <h3 style={{ color: "var(--navy)", margin: 0 }}>{link.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>{link.desc}</p>
              <div style={{ marginTop: "auto", paddingTop: "15px", color: "var(--teal)", fontWeight: "600", fontSize: "0.85rem" }}>
                OPEN TOOL →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
