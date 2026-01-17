import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/dashboard_data/");
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
      <h1>Dashboard</h1>
      <p><strong>Total Students:</strong> {data.total_students}</p>
      <p><strong>Total Schools:</strong> {data.total_schools}</p>
      <p><strong>STEM Interest %:</strong> {data.stem_percent}%</p>
      <p><strong>Upcoming Sessions:</strong> {data.upcoming_sessions}</p>
    </div>
  );
}

export default Dashboard;
