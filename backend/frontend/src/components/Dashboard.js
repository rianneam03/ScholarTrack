
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import API_BASE from "../apiConfig";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_BASE}/dashboard_data/`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }
    fetchDashboard();
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "admin";

  if (!data) return <div>Loading dashboard...</div>;

  // --- TEACHER VIEW ---
  if (role === "teacher") {
    return (
      <div className="page-container transition-fade">
        <div className="dashboard-header" style={{marginBottom: '30px'}}>
          <h2 style={{margin: 0, fontSize: '1.8rem'}}>Teacher Dashboard</h2>
          <p style={{color: 'var(--text-secondary)', margin: '5px 0 0 0'}}>Welcome back, {user.fullname || "Teacher"}</p>
        </div>

        <div className="stats-grid-v2">
          <div className="stat-card-v3">
            <div className="stat-card-header">
              <div className="stat-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            </div>
            <div className="stat-value-v3">3</div>
            <div className="stat-label-v3">Sessions Today</div>
          </div>
          <div className="stat-card-v3">
            <div className="stat-card-header">
              <div className="stat-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            </div>
            <div className="stat-value-v3">24</div>
            <div className="stat-label-v3">Total Students</div>
          </div>
          <div className="stat-card-v3">
            <div className="stat-card-header">
              <div className="stat-icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            </div>
            <div className="stat-value-v3">98%</div>
            <div className="stat-label-v3">Attendance Avg</div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-wrapper">
             <h3>My Upcoming Sessions</h3>
             <p className="helper-text">You have 3 sessions scheduled for this week.</p>
             {/* Mocking a list for visual fidelity */}
             <ul style={{listStyle: 'none', padding: 0, marginTop: '15px'}}>
                <li style={{padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border)'}}>
                   <strong>Robotics 101</strong> - Tomorrow, 4:00 PM
                </li>
                <li style={{padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border)'}}>
                   <strong>Math Intensive</strong> - Thursday, 3:30 PM
                </li>
             </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  return (
    <div className="page-container transition-fade">
      <div className="dashboard-header" style={{marginBottom: '30px'}}>
        <h2 style={{margin: 0, fontSize: '1.8rem'}}>Admin Dashboard</h2>
        <p style={{color: 'var(--text-secondary)', margin: '5px 0 0 0'}}>Welcome back, {user.fullname || "Admin User"}</p>
      </div>

      <div className="section-header" style={{borderLeft: '4px solid var(--teal)', paddingLeft: '15px', marginBottom: '25px'}}>
        <h3 style={{margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--navy)'}}>Program Overview</h3>
      </div>
      <div className="stats-grid-v2">
        {/* Total Students */}
        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="stat-growth success">+12%</div>
          </div>
          <div className="stat-value-v3">{data.total_students}</div>
          <div className="stat-label-v3">Total Students</div>
        </div>

        {/* Active Programs */}
        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div className="stat-growth success">+3</div>
          </div>
          <div className="stat-value-v3">{data.active_programs || 0}</div>
          <div className="stat-label-v3">Active Programs</div>
        </div>

        {/* Staff Members */}
        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            </div>
            <div className="stat-growth success">+5</div>
          </div>
          <div className="stat-value-v3">{data.total_staff || 0}</div>
          <div className="stat-label-v3">Staff Members</div>
        </div>

        {/* Attendance Rate */}
        <div className="stat-card-v3">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="stat-growth success">+2.1%</div>
          </div>
          <div className="stat-value-v3">{data.attendance_rate}%</div>
          <div className="stat-label-v3">Attendance Rate</div>
        </div>
      </div>

      {/* 2. DEMOGRAPHICS & IMPACT */}
      <h3>Demographics & Impact</h3>
      <div className="charts-container">

        {/* Students by Site (High Impact) */}
        <div className="chart-wrapper">
          <h3>Students by Site</h3>
          <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
            <ResponsiveContainer>
              <BarChart data={data.students_by_school} margin={{ bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4FA3B8" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Over Time */}
        <div className="chart-wrapper chart-card">
          <h3>Program Growth (New Enrollments)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.student_growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1E3A5F" strokeWidth={3} name="New Students" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Existing Charts */}
        <div className="chart-wrapper chart-card">
          <h3>Students by Grade</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.students_by_grade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1E3A5F" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-wrapper chart-card">
          <h3>STEM Interest Distribution</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.stem_data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.stem_data && data.stem_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
