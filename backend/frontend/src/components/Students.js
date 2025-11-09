import React, { useEffect, useState } from "react";

import API_BASE from "../apiConfig";

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

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = () => {
    fetch("http://127.0.0.1:8000/api/students/")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
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

  // ✅ Add Student
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/students/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          alert("✅ Student added successfully!");
          fetchStudents();
          setFormData({
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
        }
      })
      .catch((err) => console.error("Error adding student:", err));
  };

  // 🗑 Delete Student (Admin only)
  const handleDelete = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      alert("❌ Only admins can delete students.");
      return;
    }

    if (!formData.StudentID.trim()) {
      alert("⚠️ Please enter a Student ID first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${formData.StudentID}?`)) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/students/?StudentID=${formData.StudentID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Username": user.username,
          },
        }
      );

      const data = await res.json();
      alert(data.message || data.error);
      fetchStudents();
      setFormData({
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
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Server error while deleting student");
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  return (
    <div className="page-container">
      <h2>Students List</h2>

      {/* --- Add/Delete Form --- */}
      <form onSubmit={handleSubmit} className="form-container">
        <input name="StudentID" placeholder="Student ID" value={formData.StudentID} onChange={handleChange} required />
        <input name="FirstName" placeholder="First Name" value={formData.FirstName} onChange={handleChange} required />
        <input name="LastName" placeholder="Last Name" value={formData.LastName} onChange={handleChange} required />
        <input name="Grade" placeholder="Grade" value={formData.Grade} onChange={handleChange} />
        <select name="SchoolID" value={formData.SchoolID} onChange={handleChange}>
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>
        <input name="StudentPhone" placeholder="Student Phone" value={formData.StudentPhone} onChange={handleChange} />
        <input name="GuardianName" placeholder="Guardian Name" value={formData.GuardianName} onChange={handleChange} />
        <input name="GuardianPhone" placeholder="Guardian Phone" value={formData.GuardianPhone} onChange={handleChange} />
        <input name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />
        <select name="STEMInterest" value={formData.STEMInterest} onChange={handleChange}>
          <option value="">Select STEM Interest</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Undecided">Undecided</option>
        </select>
        <input name="EnrollmentDate" type="date" value={formData.EnrollmentDate} onChange={handleChange} />

        <div style={{ marginTop: "10px" }}>
          <button type="submit" style={{ marginRight: "10px" }}>
            Add Student
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              className="delete-btn"
            >
              Delete Student
            </button>
          )}
        </div>
      </form>

      {/* --- Students Table --- */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>Student Phone</th>
            <th>Guardian Name</th>
            <th>Guardian Phone</th>
            <th>Email</th>
            <th>STEM Interest</th>
            <th>Enrollment Date</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.StudentID}>
              <td>{s.StudentID}</td>
              <td>{s.FirstName} {s.LastName}</td>
              <td>{s.Grade}</td>
              <td>{s.SchoolName}</td>
              <td>{s.StudentPhone || "-"}</td>
              <td>{s.GuardianName || "-"}</td>
              <td>{s.GuardianPhone || "-"}</td>
              <td>{s.Email || "-"}</td>
              <td>{s.STEMInterest}</td>
              <td>{s.EnrollmentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

useEffect(() => {
  fetch(`${API_BASE}/api/students/`)
    .then(res => res.json())
    .then(data => setStudents(data))
    .catch(err => console.error("Error fetching students:", err));
}, []);

export default Students;
