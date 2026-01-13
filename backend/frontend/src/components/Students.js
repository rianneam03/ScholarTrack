import React, { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
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
  });

  // AUTH
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "teacher";

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/"
    );
    setStudents(await res.json());
  };

  const fetchSchools = async () => {
    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/schools/"
    );
    setSchools(await res.json());
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // =======================
  // ➕ ADD STUDENT (POST)
  // =======================
  const handleAdd = async () => {
    if (!formData.StudentID) {
      alert("Student ID is required");
      return;
    }

    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Username: user.username,
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to add student");
      return;
    }

    alert("✅ Student added successfully!");
    fetchStudents();
  };

  // =======================
  // ✏️ UPDATE STUDENT (PATCH)
  // =======================
  const handleUpdate = async () => {
    if (!formData.StudentID) {
      alert("Student ID is required");
      return;
    }

    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/update/",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Username: user.username,
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("✅ Student updated successfully!");
    fetchStudents();
  };

  // =======================
  // 🗑 DELETE (ADMIN ONLY)
  // =======================
  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!formData.StudentID) {
      alert("Enter Student ID");
      return;
    }

    if (!window.confirm("Delete this student?")) return;

    const res = await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Username: user.username,
        },
      }
    );

    const data = await res.json();
    alert(data.message || data.error);
    fetchStudents();
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      {/* ❗ NO FORM TAG — prevents PUT */}
      <div className="form-container">
        <input
          name="StudentID"
          placeholder="Student ID"
          value={formData.StudentID}
          onChange={handleChange}
        />

        <input
          name="FirstName"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={handleChange}
        />

        <input
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
        />

        <input
          name="Grade"
          placeholder="Grade"
          value={formData.Grade}
          onChange={handleChange}
        />

        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        <select
          name="STEMInterest"
          value={formData.STEMInterest}
          onChange={handleChange}
        >
          <option value="">STEM Interest</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <input
          type="date"
          name="EnrollmentDate"
          value={formData.EnrollmentDate}
          onChange={handleChange}
        />

        {/* ADMIN ONLY CONTACT INFO */}
        {isAdmin && (
          <>
            <input
              name="StudentPhone"
              placeholder="Student Phone"
              value={formData.StudentPhone}
              onChange={handleChange}
            />
            <input
              name="GuardianName"
              placeholder="Guardian Name"
              value={formData.GuardianName}
              onChange={handleChange}
            />
            <input
              name="GuardianPhone"
              placeholder="Guardian Phone"
              value={formData.GuardianPhone}
              onChange={handleChange}
            />
            <input
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
            />
          </>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={handleAdd}>
            ➕ Add Student
          </button>

          <button type="button" onClick={handleUpdate}>
            ✏️ Update Student
          </button>

          {isAdmin && (
            <button type="button" className="delete-btn" onClick={handleDelete}>
              🗑 Delete Student
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>STEM</th>
            <th>Enroll Date</th>
            {isAdmin && (
              <>
                <th>Student Phone</th>
                <th>Guardian</th>
                <th>Guardian Phone</th>
                <th>Email</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.StudentID}>
              <td>{s.StudentID}</td>
              <td>{s.FirstName} {s.LastName}</td>
              <td>{s.Grade}</td>
              <td>{s.SchoolName}</td>
              <td>{s.STEMInterest}</td>
              <td>{s.EnrollmentDate}</td>

              {isAdmin && (
                <>
                  <td>{s.StudentPhone}</td>
                  <td>{s.GuardianName}</td>
                  <td>{s.GuardianPhone}</td>
                  <td>{s.Email}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
