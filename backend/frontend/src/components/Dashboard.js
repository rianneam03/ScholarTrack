
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("https://scholartrack-backend-bgas.onrender.com/api/dashboard_data/");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }
    fetchDashboard();
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="page-container">
      <h2>Dashboard</h2>

      {/* 1. OVERVIEW STATS */}
      <h3>Program Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Students</h4>
          <p className="stat-value">{data.total_students}</p>
        </div>
        <div className="stat-card">
          <h4>Total Schools</h4>
          <p className="stat-value">{data.total_schools}</p>
        </div>
        <div className="stat-card">
          <h4>Sessions Conducted</h4>
          <p className="stat-value">{data.sessions_conducted}</p>
          <div className="stat-sub">
            <span className="label">Upcoming:</span>
            <span className="value">{data.upcoming_sessions}</span>
          </div>
        </div>
        <div className="stat-card">
          <h4>Avg Attendance</h4>
          <p className="stat-value">{data.avg_attendance}</p>
          <div className="stat-sub">
            <span className="label">Rate:</span>
            <span className="value">{data.attendance_rate}%</span>
          </div>
        </div>
      </div>

      {/* 2. DEMOGRAPHICS & IMPACT */}
      <h3>Demographics & Impact</h3>
      <div className="charts-container">

        {/* Students by Site (High Impact) */}
        <div className="chart-wrapper">
          <h3>Students by Site</h3>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={data.students_by_school} margin={{ bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4FA3B8" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Over Time */}
        <div className="chart-wrapper">
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
        <div className="chart-wrapper">
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

        <div className="chart-wrapper">
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
