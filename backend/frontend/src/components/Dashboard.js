
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
      <div className="section-title">Program Overview</div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{data.total_students}</p>
        </div>
        <div className="stat-card">
          <h3>Total Schools</h3>
          <p className="stat-value">{data.total_schools}</p>
        </div>
        <div className="stat-card">
          <h3>Sessions Conducted</h3>
          <p className="stat-value">{data.sessions_conducted}</p>
          <p className="stat-sub">Upcoming: {data.upcoming_sessions}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Attendance</h3>
          <p className="stat-value">{data.avg_attendance}</p>
          <p className="stat-sub">Rate: {data.attendance_rate}%</p>
        </div>
      </div>

      {/* 2. DEMOGRAPHICS & IMPACT */}
      <div className="section-title">Demographics & Impact</div>
      <div className="charts-container">

        {/* Students by School (High Impact) */}
        <div className="chart-wrapper full-width">
          <h3>Students by School</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.students_by_school}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4FA3B8" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Over Time */}
        <div className="chart-wrapper full-width">
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
