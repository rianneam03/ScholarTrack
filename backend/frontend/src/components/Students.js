import React, { useEffect, useState } from "react";

function Students({ isAdmin, isStaff }) {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    StudentID: "",
    FirstName: "",
    LastName: "",
    STEMInterest: "",
    EnrollmentDate: "",
    SchoolID: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/"
    );
    const data = await res.json();
    setStudents(data);
  };

  const fetchSchools = async () => {
    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/schools/"
    );
    const data = await res.json();
    setSchools(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ ADD STUDENT (Admin + Staff)
  const handleAdd = async (e) => {
    e.preventDefault();

    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Add failed");
      return;
    }

    alert("✅ Student added");
    resetForm();
    fetchStudents();
  };

  // ✅ UPDATE STUDENT (Admin + Staff)
  const handleUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/${formData.StudentID}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("✅ Student updated");
    resetForm();
    fetchStudents();
  };

  // ❌ DELETE (ADMIN ONLY)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/${id}/`,
      { method: "DELETE" }
    );

    fetchStudents();
  };

  const handleEdit = (student) => {
    setEditing(true);
    setFormData({
      StudentID: student.StudentID,
      FirstName: student.FirstName || "",
      LastName: student.LastName || "",
      STEMInterest: student.STEMInterest || "",
      EnrollmentDate: student.EnrollmentDate || "",
      SchoolID: student.SchoolID || "",
    });
  };

  const resetForm = () => {
    setEditing(false);
    setFormData({
      StudentID: "",
      FirstName: "",
      LastName: "",
      STEMInterest: "",
      EnrollmentDate: "",
      SchoolID: "",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Students</h2>

      {/* ===== FORM ===== */}
      <form onSubmit={editing ? handleUpdate : handleAdd}>
        <input
          name="StudentID"
          placeholder="Student ID"
          value={formData.StudentID}
          onChange={handleChange}
          required
          disabled={editing}
        />

        <input
          name="FirstName"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={handleChange}
          required
        />

        <input
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
          required
        />

        <input
          name="STEMInterest"
          placeholder="STEM Interest"
          value={formData.STEMInterest}
          onChange={handleChange}
        />

        <input
          type="date"
          name="EnrollmentDate"
          value={formData.EnrollmentDate}
          onChange={handleChange}
        />

        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
          required
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        <button type="submit">
          {editing ? "Update Student" : "Add Student"}
        </button>

        {editing && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {/* ===== TABLE ===== */}
      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>STEM</th>
            <th>School</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.StudentID}>
              <td>{s.StudentID}</td>
              <td>
                {s.FirstName} {s.LastName}
              </td>
              <td>{s.STEMInterest}</td>
              <td>{s.SchoolName}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                {isAdmin && (
                  <button onClick={() => handleDelete(s.StudentID)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
