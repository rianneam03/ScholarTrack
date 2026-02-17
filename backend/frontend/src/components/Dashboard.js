import React, { useEffect, useState } from "react";

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
      <h1>Dashboard</h1>
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
          <h3>STEM Interest</h3>
          <p className="stat-value">{data.stem_percent}%</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Sessions</h3>
          <p className="stat-value">{data.upcoming_sessions}</p>
        </div>
      </div>

      <NeedsSection />
    </div>
  );
}

function NeedsSection() {
  const [needs, setNeeds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newNeed, setNewNeed] = useState({
    title: "",
    description: "",
    amount_needed: "",
    urgency: "Medium",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isDonor = user?.role === "donor";
  const isAdminOrTeacher = ["admin", "teacher"].includes(user?.role);

  useEffect(() => {
    fetchNeeds();
  }, []);

  async function fetchNeeds() {
    try {
      const res = await fetch("https://scholartrack-backend-bgas.onrender.com/api/needs/");
      const json = await res.json();
      setNeeds(json);
    } catch (err) {
      console.error("Error fetching needs:", err);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await fetch("https://scholartrack-backend-bgas.onrender.com/api/needs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Username": user.username,
        },
        body: JSON.stringify(newNeed),
      });
      if (res.ok) {
        setShowForm(false);
        setNewNeed({ title: "", description: "", amount_needed: "", urgency: "Medium" });
        fetchNeeds();
      }
    } catch (err) {
      console.error("Error creating need:", err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`https://scholartrack-backend-bgas.onrender.com/api/needs/${id}/`, {
        method: "DELETE",
        headers: { "Username": user.username },
      });
      if (res.ok) fetchNeeds();
    } catch (err) {
      console.error("Error deleting need:", err);
    }
  }

  return (
    <div className="needs-container">
      <div className="needs-header">
        <h2>{isDonor ? "Funding Opportunities" : "Program Needs"}</h2>
        {isAdminOrTeacher && (
          <button className="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add New Need"}
          </button>
        )}
      </div>

      {showForm && (
        <form className="need-form card" onSubmit={handleCreate}>
          <input
            placeholder="Title"
            value={newNeed.title}
            onChange={(e) => setNewNeed({ ...newNeed, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newNeed.description}
            onChange={(e) => setNewNeed({ ...newNeed, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount Needed ($)"
            value={newNeed.amount_needed}
            onChange={(e) => setNewNeed({ ...newNeed, amount_needed: e.target.value })}
            required
          />
          <select
            value={newNeed.urgency}
            onChange={(e) => setNewNeed({ ...newNeed, urgency: e.target.value })}
          >
            <option value="Low">Low Urgency</option>
            <option value="Medium">Medium Urgency</option>
            <option value="High">High Urgency</option>
          </select>
          <button type="submit" className="primary">Post Need</button>
        </form>
      )}

      <div className="needs-grid">
        {needs.map((need) => (
          <div key={need.needid} className={`need-card urgency-${need.urgency.toLowerCase()}`}>
            <div className="need-header">
              <h3>{need.title}</h3>
              <span className="urgency-tag">{need.urgency}</span>
            </div>
            <p className="need-desc">{need.description}</p>

            <div className="progress-container">
              <div className="progress-labels">
                <span>Raised: ${need.current_amount}</span>
                <span>Goal: ${need.amount_needed}</span>
              </div>
              <progress value={need.current_amount} max={need.amount_needed}></progress>
            </div>

            {isDonor && (
              <button className="donate-btn" onClick={() => alert("Thank you for your interest! Donation feature coming soon.")}>
                Donate Now
              </button>
            )}

            {isAdminOrTeacher && (
              <button className="delete-btn" onClick={() => handleDelete(need.needid)}>
                Remove
              </button>
            )}
          </div>
        ))}
        {needs.length === 0 && <p>No active needs at the moment.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
