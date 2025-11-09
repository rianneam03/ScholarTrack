import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";

useEffect(() => {
  fetch(`${API_BASE}/api/Sessions/`)
    .then(res => res.json())
    .then(data => setSessions(data))
    .catch(err => console.error("Error fetching Sessions:", err));
}, []);

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    Title: "",
    SessionDate: "",
    Description: "",
    SchoolID: "",
  });

  useEffect(() => {
    fetchSessions();
    fetchSchools();
  }, []);

  const fetchSessions = () => {
    fetch("http://127.0.0.1:8000/api/sessions/")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.error("Error fetching sessions:", err));
  };

  const fetchSchools = () => {
    fetch("http://127.0.0.1:8000/api/schools/")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((err) => console.error("Error fetching schools:", err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/sessions/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("❌ " + data.error);
        } else {
          alert("✅ " + data.message);
          setFormData({
            Title: "",
            SessionDate: "",
            Description: "",
            SchoolID: "",
          });
          fetchSessions();
        }
      })
      .catch((err) => console.error("Error adding session:", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sessions</h2>

      {/* --- Add Session Form --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
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

        {/* ✅ Dropdown for School */}
        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select School --</option>
          {schools.length > 0 ? (
            schools.map((s) => (
              <option key={s.SchoolID} value={s.SchoolID}>
                {s.SchoolName}
              </option>
            ))
          ) : (
            <option value="">(No schools available)</option>
          )}
        </select>

        <button type="submit">Add Session</button>
      </form>

      {/* --- Sessions Table --- */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date</th>
            <th>Description</th>
            <th>School</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <tr key={s.SessionID}>
                <td>{s.SessionID}</td>
                <td>{s.Title}</td>
                <td>{s.SessionDate}</td>
                <td>{s.Description}</td>
                <td>{s.SchoolName || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No sessions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Sessions;
