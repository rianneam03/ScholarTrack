import React, { useEffect, useState } from "react";

const API_BASE = "https://scholartrack-backend-7vzy.onrender.com";

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

  // ---------------- FETCH ----------------
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students/`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/schools/`);
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  // ---------------- FORM ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- ADD STUDENT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
    } catch (err) {
      console.error("Add student error:", err);
      alert("❌ Server error while adding student");
    }
  };

  // ---------------- DELETE STUDENT ----------------
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
        API_BASE`/api/students/?StudentID=${formData.StudentID}`,
        { 
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Username": user.username, // ✅ REQUIRED
          },
        }
      );

      const data = await res.json();
      alert(data.message || data.error);
      fetchStudents();

    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Server error while deleting student");
    }
  };


  // ---------------- UI ----------------
  return (
    <div className="page-container">
      <h2>Students</h2>

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
          <option value="">STEM Interest</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Undecided">Undecided</option>
        </select>

        <input type="date" name="EnrollmentDate" value={formData.EnrollmentDate} onChange={handleChange} />

        <button type="submit">Add Student</button>

        {isAdmin && (
          <button type="button" onClick={handleDelete} className="delete-btn">
            Delete Student
          </button>
        )}
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>Email</th>
            <th>STEM</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.StudentID}>
              <td>{s.StudentID}</td>
              <td>{s.FirstName} {s.LastName}</td>
              <td>{s.Grade}</td>
              <td>{s.SchoolName || "-"}</td>
              <td>{s.Email || "-"}</td>
              <td>{s.STEMInterest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
