import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#FF8042"];

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(
          "https://scholartrack-backend-bgas.onrender.com/api/dashboard_data/"
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }
    fetchDashboard();
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  const pieData = [
    { name: "STEM Interested", value: data.stem_percent },
    { name: "Other", value: 100 - data.stem_percent },
  ];

  return (
    <div className="page-container" style={{ padding: "30px" }}>
      <h1>ScholarTrack Analytics Dashboard</h1>

      {/* Metric Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div className="card">
          <h3>Total Students</h3>
          <p>{data.total_students}</p>
        </div>
        <div className="card">
          <h3>Total Schools</h3>
          <p>{data.total_schools}</p>
        </div>
        <div className="card">
          <h3>Upcoming Sessions</h3>
          <p>{data.upcoming_sessions}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
        {/* Bar Chart */}
        <div style={{ flex: 1, minWidth: "400px", height: "350px" }}>
          <h3>Students Per School</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.students_per_school}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="school_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ flex: 1, minWidth: "400px", height: "350px" }}>
          <h3>STEM Interest Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
