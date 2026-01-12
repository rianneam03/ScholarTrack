import React, { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔑 ADD or UPDATE student
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUpdate = students.some(
      (s) => String(s.StudentID) === String(formData.StudentID)
    );

    const url = isUpdate
      ? `https://scholartrack-backend-7vzy.onrender.com/api/students/${formData.StudentID}/`
      : "https://scholartrack-backend-7vzy.onrender.com/api/students/";

    const method = isUpdate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Operation failed");
        return;
      }

      alert(isUpdate ? "✅ Student updated!" : "✅ Student added!");
      setFormData({
        StudentID: "",
        FirstName: "",
        LastName: "",
        STEMInterest: "",
        EnrollmentDate: "",
        SchoolID: "",
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // ✏️ Load student into form
  const handleEdit = (student) => {
    setFormData({
      StudentID: student.StudentID,
      FirstName: student.FirstName || "",
      LastName: student.LastName || "",
      STEMInterest: student.STEMInterest || "",
      EnrollmentDate: student.EnrollmentDate || "",
      SchoolID: student.SchoolID || "",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students</h2>

      {/* --- Add / Update Form --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <h3>Add / Update Student</h3>

        <input
          type="number"
          name="StudentID"
          placeholder="Student ID"
          value={formData.StudentID}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="FirstName"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
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
          <option value="">-- Select School --</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        <button type="submit">
          {formData.StudentID ? "Save Student" : "Add Student"}
        </button>
      </form>

      {/* --- Students Table --- */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>STEM Interest</th>
            <th>Enrollment Date</th>
            <th>School</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.StudentID}>
                <td>{s.StudentID}</td>
                <td>
                  {s.FirstName} {s.LastName}
                </td>
                <td>{s.STEMInterest}</td>
                <td>{s.EnrollmentDate}</td>
                <td>{s.SchoolName || "-"}</td>
                <td>
                  <button onClick={() => handleEdit(s)}>Edit</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Students;
