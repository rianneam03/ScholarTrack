import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";

function Schools() {
  const [schools, setSchools] = useState([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  // --- Load existing schools ---
  const loadSchools = () => {
    fetch(`${API_BASE}/schools/`)
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // --- Add a new school ---
  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) {
      alert("Please enter a site name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/schools/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Username: user.username,
          },
          body: JSON.stringify({ SchoolName: newSchoolName }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to add site");
      }

      setNewSchoolName("");
      loadSchools();
      alert("✅ Site added successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error adding site.");
    } finally {
      setLoading(false);
    }
  };

  // Compute totals
  const totalStudents = schools.reduce((sum, s) => sum + (s.StudentCount || 0), 0);
  const totalSessions = schools.reduce((sum, s) => sum + (s.SessionCount || 0), 0);

  return (
    <div className="page-container">
      <h2>School Sites</h2>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: "30px" }}>
        <div className="stat-card">
          <h4>Total Sites</h4>
          <p className="stat-value">{schools.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Students</h4>
          <p className="stat-value">{totalStudents}</p>
        </div>
        <div className="stat-card">
          <h4>Total Sessions</h4>
          <p className="stat-value">{totalSessions}</p>
        </div>
      </div>

      {/* Add Site Form (Admin Only) */}
      {isAdmin && (
        <>
          <h3>Add New Site</h3>
          <div className="add-school-card">
            <input
              type="text"
              placeholder="Enter site name"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSchool()}
            />
            <button className="primary" onClick={handleAddSchool} disabled={loading}>
              {loading ? "Adding…" : "➕ Add Site"}
            </button>
          </div>
        </>
      )}

      {/* Site Cards */}
      <h3>Current Sites</h3>
      {schools.length === 0 ? (
        <div className="empty-state">
          <p>No sites have been added yet.</p>
          {isAdmin && <p>Use the form above to add your first site.</p>}
        </div>
      ) : (
        <div className="school-cards-grid">
          {schools.map((s) => (
            <div className="school-card" key={s.SchoolID}>
              <div className="school-card-header">
                <h4>{s.SchoolName}</h4>
              </div>
              <div className="school-card-stats">
                <div className="school-card-stat">
                  <span className="school-stat-value">{s.StudentCount || 0}</span>
                  <span className="school-stat-label">Students</span>
                </div>
                <div className="school-card-stat">
                  <span className="school-stat-value">{s.SessionCount || 0}</span>
                  <span className="school-stat-label">Sessions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Schools;
