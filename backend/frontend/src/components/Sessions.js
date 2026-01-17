import React, { useEffect, useState } from "react";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    Title: "",
    SessionDate: "",
    Description: "",
    SchoolID: "",
  });

  // ✅ Auth state
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";
  const isStaff = user && user.role === "teacher";

  useEffect(() => {
    fetchSessions();
    fetchSchools();
  }, []);

  const fetchSessions = () => {
    fetch("https://scholartrack-backend-7vzy.onrender.com/api/sessions/")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.error("Error fetching sessions:", err));
  };

  const fetchSchools = () => {
    fetch("https://scholartrack-backend-7vzy.onrender.com/api/schools/")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((err) => console.error("Error fetching schools:", err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👑 ADMIN: add session
    try {
      const res = await fetch(
        "https://scholartrack-backend-7vzy.onrender.com/api/sessions/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add session");
        return;
      }

      alert("✅ Session added!");
      fetchSessions(); // refresh session list
      setFormData({ Title: "", SessionDate: "", Description: "", SchoolID: "" });
    } catch (err) {
      console.error(err);
      alert("Server error while adding session");
    }
  };

  return (
    <div className="page-container">
      <h2>Sessions</h2>

      {/* --- Add Session Form --- */}
      <form onSubmit={handleSubmit} className="session-form">
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

        {/* Dropdown for School */}
        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Site --</option>
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

        <button className="primary" type="submit">Add Session</button>
      </form>

      {/* --- Sessions Table --- */}
      <table >
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
