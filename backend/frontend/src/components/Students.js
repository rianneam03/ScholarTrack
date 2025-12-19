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

  // ✅ AUTH STATE (THIS WAS MISSING)
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";
  const isStaff = user?.role === "teacher";
  
  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        "https://scholartrack-backend-7vzy.onrender.com/api/students/"
      );
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch(
        "https://scholartrack-backend-7vzy.onrender.com/api/schools/"
      );
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ➕ ADD STUDENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      EnrollmentDate: formData.EnrollmentDate || null,
      StudentPhone: formData.StudentPhone || null,
      GuardianName: formData.GuardianName || null,
      GuardianPhone: formData.GuardianPhone || null,
      Email: formData.Email || null,
      STEMInterest: formData.STEMInterest || null,
      SchoolID: formData.SchoolID || null,
    };

    try {
      const res = await fetch(
        "https://scholartrack-backend-7vzy.onrender.com/api/students/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
      console.error("Error adding student:", err);
      alert("Server error while adding student");
    }
  };

  // 🗑 DELETE STUDENT (ADMIN ONLY)
  const handleDelete = async () => {
    if (!isAdmin) {
      alert("❌ Only admins can delete students.");
      return;
    }

    if (!formData.StudentID.trim()) {
      alert("⚠️ Enter Student ID first.");
      return;
    }

    if (!window.confirm(`Delete ${formData.StudentID}?`)) return;

    try {
      const res = await fetch(
        `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Username": user.username, // 🔑 REQUIRED
          },
        }
      );

      const data = await res.json();
      alert(data.message || data.error);
      fetchStudents();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Server error while deleting student");
    }
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      <form onSubmit={handleSubmit} className="form-container">

        {/* Everyone sees basic identity fields */}
        <input
          name="StudentID"
          placeholder="Student ID"
          value={formData.StudentID}
          onChange={handleChange}
          required
          disabled={isStaff}   // 👈 staff cannot change ID
        />

        <input
          name="FirstName"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={handleChange}
          required
          disabled={isStaff}
        />

        <input
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
          required
          disabled={isStaff}
        />

        <input
          name="Grade"
          placeholder="Grade"
          value={formData.Grade}
          onChange={handleChange}
          disabled={isStaff}
        />

        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
          disabled={isStaff}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        {/* ✅ Admin + Staff can edit STEM Interest */}
        {(isAdmin || isStaff) && (
          <input
            name="STEMInterest"
            placeholder="STEM Interest"
            value={formData.STEMInterest}
            onChange={handleChange}
          />
        )}

        {/* ✅ Admin + Staff can edit Enrollment Date */}
        {(isAdmin || isStaff) && (
          <input
            type="date"
            name="EnrollmentDate"
            value={formData.EnrollmentDate}
            onChange={handleChange}
          />
        )}

        {/* 🔒 Admin-only fields */}
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

        <button type="submit">
          {isAdmin ? "Add / Update Student" : "Update STEM Info"}
        </button>

        {/* 🗑 Admin-only delete */}
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
          <th>STEM Interest</th>
          <th>Enrollment Date</th>

          {isAdmin && (
            <>
              <th>Student Phone</th>
              <th>Guardian Name</th>
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
