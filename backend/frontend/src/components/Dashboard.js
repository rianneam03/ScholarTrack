import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState(null);
  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p><strong>Total Students:</strong> {data.total_students}</p>
      <p><strong>Total Schools:</strong> {data.total_schools}</p>
      <p><strong>STEM Interest %:</strong> {data.stem_percent}%</p>
      <p><strong>Upcoming Sessions:</strong> {data.upcoming_sessions}</p>
    </div>
  );
}

export default Dashboard;