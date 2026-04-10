import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import api from "../apiAgent";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

function Dashboard() {
  const [data, setData] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "admin";

  const isTeacherDash = location.pathname === "/teacher-dashboard";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Always fetch overview data as everyone sees it
        const res = await api.get('/dashboard_data/');
        setData(res.data);

        // Fetch teacher specific data if on that tab
        if (isTeacherDash && role === "teacher") {
          const tRes = await api.get('/teacher/dashboard/');
          setTeacherData(tRes.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isTeacherDash, role, user?.username]);

  if (loading) return <div className="page-container">Loading Dashboard...</div>;

  // --- RENDER TEACHER DASHBOARD (Recent Classes) ---
  if (isTeacherDash && role === "teacher") {
    return (
      <div className="page-container transition-fade">
        <div className="dashboard-header" style={{ marginBottom: "30px" }}>
          <h2 style={{ margin: 0, fontSize: "1.8rem" }}>Teacher Dashboard</h2>
          <p style={{ color: "var(--text-secondary)", margin: "5px 0 0 0" }}>Manage your assigned programs and sessions</p>
        </div>

        <div className="section-header" style={{ marginBottom: "25px" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--navy)" }}>My Assigned Programs</h3>
        </div>

        <div className="recent-classes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
          {teacherData?.assigned_programs?.map((prog) => (
            <div key={prog.id} className="class-card-v5" style={{ background: "white", padding: "25px", borderRadius: "15px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <h4 style={{ margin: 0, color: "var(--navy)", fontSize: "1.2rem" }}>{prog.name}</h4>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{prog.year}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>{prog.student_count} Students Enrolled</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => window.location.href = `/attendance?program_year_id=${prog.id}`} style={{ flex: 1, background: "var(--teal)", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Mark Attendance</button>
                <button onClick={() => window.location.href = "/sessions"} style={{ background: "rgba(79, 163, 184, 0.1)", color: "var(--teal)", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Sessions</button>
              </div>
            </div>
          ))}
          {teacherData?.assigned_programs?.length === 0 && <p>No programs currently assigned to you.</p>}
        </div>

        <div className="section-header" style={{ marginTop: "50px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--navy)" }}>Recent Sessions</h3>
          <button onClick={() => window.location.href = "/sessions"} style={{ background: "var(--navy)", color: "white", border: "none", padding: "8px 20px", borderRadius: "30px", cursor: "pointer", fontSize: "0.85rem" }}>+ Create New Session</button>
        </div>

        <div className="sessions-list-v5" style={{ background: "white", border: "1px solid var(--border)", borderRadius: "15px", overflow: "hidden" }}>
          {teacherData?.recent_sessions?.map((s, idx) => (
            <div key={s.id} style={{ padding: "15px 25px", borderBottom: idx === teacherData.recent_sessions.length - 1 ? "none" : "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>{s.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{s.program} • {s.date}</div>
              </div>
              <button style={{ color: "var(--teal)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>Details</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER UNIFIED OVERVIEW (Admin, Teacher, Parent, Donor) ---
  return (
    <div className="page-container transition-fade">
      <div className="dashboard-header" style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0, fontSize: "1.8rem" }}>Program Overview</h2>
        <p style={{ color: "var(--text-secondary)", margin: "5px 0 0 0" }}>ScholarTrack Impact & Statistics</p>
      </div>

      <div className="stats-grid-v2">
        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="stat-growth success">+12%</div>
          </div>
          <div className="stat-value-v3">{data?.total_students || 0}</div>
          <div className="stat-label-v3">Total Students</div>
        </div>

        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div className="stat-growth success">+3</div>
          </div>
          <div className="stat-value-v3">{data?.active_programs || 0}</div>
          <div className="stat-label-v3">Active Programs</div>
        </div>

        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div className="stat-value-v3">{data?.attendance_rate || 0}%</div>
          <div className="stat-label-v3">Attendance Rate</div>
        </div>

        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
          <div className="stat-value-v3">{data?.total_staff || 0}</div>
          <div className="stat-label-v3">Staff Members</div>
        </div>
      </div>

      <div className="charts-container" style={{ marginTop: "40px" }}>
        <div className="chart-wrapper chart-card">
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", color: "var(--navy)" }}>Students by Site</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data?.students_by_school || []} margin={{ bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--teal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-wrapper chart-card">
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", color: "var(--navy)" }}>Growth (New Enrollments)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data?.student_growth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--navy)" strokeWidth={3} dot={{ r: 6, fill: "var(--teal)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
