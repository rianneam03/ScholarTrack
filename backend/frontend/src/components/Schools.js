import React, { useEffect, useState } from "react";

function Schools() {
  const [schools, setSchools] = useState([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // --- Load existing schools ---
  const loadSchools = () => {
    fetch("https://scholartrack-backend-7vzy.onrender.com/api/schools/")
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
      alert("Please enter a school name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://scholartrack-backend-7vzy.onrender.com/api/schools/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Username: user.username, // if backend requires
          },
          body: JSON.stringify({ SchoolName: newSchoolName }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to add site");
      }

      setNewSchoolName("");
      loadSchools(); // Refresh the list
      alert("✅ Site added successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error adding site.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>School Sites</h2>

      <div className="add-school">
        <input
          type="text"
          placeholder="Enter site name"
          value={newSchoolName}
          onChange={(e) => setNewSchoolName(e.target.value)}
        />
        <button onClick={handleAddSchool} disabled={loading}>
          {loading ? "Adding…" : "Add School"}
        </button>
      </div>

      <h3>Current Site</h3>
      <ul>
        {schools.map((s) => (
          <li key={s.SchoolID}>{s.SchoolName}</li>
        ))}
      </ul>
    </div>
  );
}

export default Schools;
