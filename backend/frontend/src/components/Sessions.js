import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";

function Sessions({ filterProgramYearId, isCompact }) {
  const [sessions, setSessions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    Title: "",
    SessionDate: "",
    Description: "",
    ProgramYearID: filterProgramYearId || "",
  });
  const [programYears, setProgramYears] = useState([]);

  // ✅ Auth state
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  // --- Fetch sessions from backend safely ---
  const fetchSessions = async () => {
    try {
      let url = `${API_BASE}/sessions/`;
      if (filterProgramYearId) {
        url += `?program_year_id=${filterProgramYearId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setSessions([]);
    }
  };

  // --- Fetch schools for dropdown ---
  const fetchSchools = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/schools/`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setSchools([]);
    }
  };

  const fetchProgramYears = async () => {
    try {
      const res = await fetch(`${API_BASE}/program_years/`);
      const data = await res.json();
      setProgramYears(data);
    } catch (err) {
      console.error("Error fetching program years:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchSchools();
    fetchProgramYears();
  }, []);

  // --- Handle form changes ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Add new session (Admin only) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${API_BASE}/sessions/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add session");
        return;
      }

      alert("✅ Session added!");
      setFormData({
        Title: "",
        SessionDate: "",
        Description: "",
        ProgramYearID: filterProgramYearId || "",
      });
      fetchSessions(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Server error while adding session");
    }
  };

  // --- Delete session (Admin only) ---
  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/sessions/${sessionId}/`,
        {
          method: "DELETE",
          headers: {
            "Username": user.username,   // 🔑 REQUIRED
          },
        }
      );
      
      if (!res.ok) {
        const text = await res.text(); // handle HTML or error text
        console.error("Failed to delete session:", text);
        alert("Failed to delete session. Check console for details.");
        return;
      }

      alert("🗑️ Session deleted");
      fetchSessions(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Server error while deleting session");
    }
  };

  return (
    <div className={isCompact ? "" : "page-container"}>
      {!isCompact && <h2>Sessions</h2>}

      {/* --- Add Session Form (Admins only) --- */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Add New Session</h3>

          <input
            type="text"
            name="Title"
            placeholder="Title"
            value={formData.Title}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="SessionDate"
            value={formData.SessionDate}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="Description"
            placeholder="Description"
            value={formData.Description}
            onChange={handleChange}
          />

          <select
            name="ProgramYearID"
            value={formData.ProgramYearID}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Program --</option>
            {programYears.map((py) => (
              <option key={py.program_year_id} value={py.program_year_id}>
                {py.program_name} ({py.year})
              </option>
            ))}
          </select>

          <button className="primary" type="submit">
            Add Session
          </button>
        </form>
      )}

      {/* --- Sessions Table --- */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Description</th>
            <th>Program</th>
            <th>Attendance</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <tr key={s.SessionID}>
                <td>{s.Title}</td>
                <td>{s.SessionDate}</td>
                <td>{s.Description}</td>
                <td>{s.ProgramName || s.SchoolName || "-"}</td>

                <td style={{ textAlign: "center" }}>
                  <button
                    className="primary-sm"
                    onClick={() => (window.location.href = `/attendance?session_id=${s.SessionID}`)}
                  >
                    📝 Mark
                  </button>
                </td>

                {isAdmin && (
                  <td>
                    <button
                      className="delete"
                      onClick={() => handleDelete(s.SessionID)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? "5" : "4"}>No sessions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Sessions;
