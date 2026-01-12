import React, { useEffect, useState } from "react";

const API_BASE = "https://scholartrack-backend-7vzy.onrender.com";

function Students() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role; // "admin" or "teacher"
  const isAdmin = role === "admin";
  const isStaff = role === "teacher";

  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [mode, setMode] = useState("add"); // add | update

  const emptyForm = {
    StudentID: "",
    FirstName: "",
    LastName: "",
    Grade: "",
    SchoolID: "",
    StudentPhone: "",
    GuardianName: "",
    GuardianPhone: "",
    Email: "",
    STEMInterest: "",
    EnrollmentDate: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch(`${API_BASE}/api/students/`);
    const data = await res.json();
    setStudents(data);
  };

  const fetchSchools = async () => {
    const res = await fetch(`${API_BASE}/api/schools/`);
    const data = await res.json();
    setSchools(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ➕ ADD STUDENT
  const handleAdd = async () => {
    if (!formData.StudentID) {
      alert("Student ID is required");
      return;
    }

    const res = await fetch(`${API_BASE}/api/students/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to add student");
      return;
    }

    alert("✅ Student added");
    setFormData(emptyForm);
    fetchStudents();
  };

  // ✏️ UPDATE STUDENT
  const handleUpdate = async () => {
    if (!formData.StudentID) {
      alert("Student ID is required to update");
      return;
    }

    const res = await fetch(`${API_BASE}/api/students/${formData.StudentID}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to update student");
      return;
    }

    alert("✅ Student updated");
    setFormData(emptyForm);
    fetchStudents();
  };

  // 🗑 DELETE STUDENT (ADMIN ONLY)
  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!formData.StudentID) {
      alert("Enter Student ID to delete");
      return;
    }

    if (!window.confirm("Delete this student?")) return;

    const res = await fetch(
      `${API_BASE}/api/students/${formData.StudentID}/`,
      { method: "DELETE" }
    );

    const data = await res.json();
    alert(data.message || data.error);
    setFormData(emptyForm);
    fetchStudents();
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      {/* MODE SWITCH */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setMode("add")}>➕ Add</button>
        <button onClick={() => setMode("update")}>✏️ Update</button>
        {isAdmin && <button onClick={handleDelete}>🗑 Delete</button>}
      </div>

      {/* FORM */}
      <div className="form-container">
        {Object.keys(emptyForm).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={formData[key] || ""}
            onChange={handleChange}
            type={key === "EnrollmentDate" ? "date" : "text"}
          />
        ))}

        {mode === "add" && <button onClick={handleAdd}>Add Student</button>}
        {mode === "update" && (
          <button onClick={handleUpdate}>Update Student</button>
        )}
      </div>

      {/* TABLE */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>STEM Interest</th>
            <th>Enrollment Date</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.StudentID}>
              <td>{s.StudentID}</td>
              <td>
                {s.FirstName} {s.LastName}
              </td>
              <td>{s.Grade}</td>
              <td>{s.SchoolName || "—"}</td>
              <td>{s.STEMInterest}</td>
              <td>{s.EnrollmentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
