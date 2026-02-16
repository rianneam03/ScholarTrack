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

  if (!data) return <div style={{ padding: 30 }}>Loading dashboard...</div>;

  const pieData = [
    { name: "STEM Interested", value: data.stem_percent },
    { name: "Other", value: 100 - data.stem_percent },
  ];

  return (
    <div style={{ padding: 30 }}>
      <h1>ScholarTrack Analytics Dashboard</h1>

      {/* Metric Cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
        <div style={cardStyle}>
          <h3>Total Students</h3>
          <p>{data.total_students}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Schools</h3>
          <p>{data.total_schools}</p>
        </div>
        <div style={cardStyle}>
          <h3>Upcoming Sessions</h3>
          <p>{data.upcoming_sessions}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        
        {/* Bar Chart */}
        <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
          <h3>Students Per School</h3>
          <BarChart
            width={500}
            height={300}
            data={data.students_per_school}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="school_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" />
          </BarChart>
        </div>

        {/* Pie Chart */}
        <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
          <h3>STEM Interest Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  minWidth: 200,
};

export default Dashboard;
