import React from "react";
import { Link } from "react-router-dom";

export default function AdminSettings() {
  const adminLinks = [
    { title: "School Management", desc: "Manage school sites and information", path: "/schools", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M10 21V10a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11"/><path d="M18 21V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M4 7h16"/></svg> },
    { title: "Guardian Directory", desc: "View and link guardians to students", path: "/guardians", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { title: "User Management", desc: "Create and manage system user accounts", path: "/admin/users", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
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
              <div className="stat-icon-box" style={{ background: "var(--teal)", marginBottom: "10px" }}>{link.icon}</div>
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
