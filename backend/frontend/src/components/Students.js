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

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
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

  // ✅ ADD or UPDATE (Admin + Staff)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.StudentID.trim()) {
      alert("Student ID is required");
      return;
    }

    const existingStudent = students.find(
      (s) => s.StudentID === formData.StudentID
    );

    let url = "https://scholartrack-backend-7vzy.onrender.com/api/students/";
    let method = "POST";

    // 🔁 UPDATE logic
    if (existingStudent) {
      if (isAdmin) {
        url = `https://scholartrack-backend-7vzy.onrender.com/api/students/${formData.StudentID}/`;
        method = "PUT";
      } else if (isStaff) {
        url =
          "https://scholartrack-backend-7vzy.onrender.com/api/students/stem/";
        method = "PATCH";
      }
    }

    const payload = {
      StudentID: formData.StudentID,
      FirstName: isStaff && existingStudent ? undefined : formData.FirstName,
      LastName: isStaff && existingStudent ? undefined : formData.LastName,
      Grade: isStaff && existingStudent ? undefined : formData.Grade,
      SchoolID: isStaff && existingStudent ? undefined : formData.SchoolID,
      StudentPhone: formData.StudentPhone || null,
      GuardianName: formData.GuardianName || null,
      GuardianPhone: formData.GuardianPhone || null,
      Email: formData.Email || null,
      STEMInterest: formData.STEMInterest || null,
      EnrollmentDate: formData.EnrollmentDate || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Operation failed");
        return;
      }

      alert(existingStudent ? "✅ Student updated" : "✅ Student added");
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
      console.error(err);
      alert("Server error");
    }
  };

  // 🗑 DELETE (Admin only)
  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!formData.StudentID.trim()) {
      alert("Enter Student ID");
      return;
    }

    if (!window.confirm("Delete this student?")) return;

    try {
      const res = await fetch(
        `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      alert(data.message || data.error);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      <form onSubmit={handleSubmit} className="form-container">
        <input
          name="StudentID"
          placeholder="Student ID"
          value={formData.StudentID}
          onChange={handleChange}
          required
        />

        <input
          name="FirstName"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={handleChange}
          disabled={isStaff}
          required={!isStaff}
        />

        <input
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
          disabled={isStaff}
          required={!isStaff}
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

        <input
          name="STEMInterest"
          placeholder="STEM Interest"
          value={formData.STEMInterest}
          onChange={handleChange}
        />

        <input
          type="date"
          name="EnrollmentDate"
          value={formData.EnrollmentDate || ""}
          onChange={handleChange}
        />

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
          {isAdmin ? "Add / Update Student" : "Add / Update Student"}
        </button>

        {isAdmin && (
          <button type="button" onClick={handleDelete}>
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
            <th>STEM</th>
            <th>Enrollment</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
