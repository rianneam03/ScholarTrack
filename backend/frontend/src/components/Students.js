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

  // ================= ADD =================
  const handleAdd = async () => {
    if (!formData.StudentID || !formData.FirstName || !formData.LastName) {
      alert("StudentID, First Name, and Last Name are required");
      return;
    }

    const payload = isAdmin
      ? formData
      : {
          StudentID: formData.StudentID,
          FirstName: formData.FirstName,
          LastName: formData.LastName,
          Grade: formData.Grade,
          SchoolID: formData.SchoolID,
          STEMInterest: formData.STEMInterest,
          EnrollmentDate: formData.EnrollmentDate,
        };

    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Username: user.username,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Add failed");
      return;
    }

    alert("✅ Student added");
    fetchStudents();
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!formData.StudentID) {
      alert("StudentID required");
      return;
    }

    const res = await fetch(
      "https://scholartrack-backend-7vzy.onrender.com/api/students/",
      {
        method: "PUT",
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

    alert("✅ Student updated");
    fetchStudents();
  };

  // ================= DELETE (ADMIN) =================
  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!formData.StudentID) {
      alert("Enter StudentID");
      return;
    }

    if (!window.confirm("Delete this student?")) return;

    const res = await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
      {
        method: "DELETE",
        headers: {
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

      <div className="form-container">
        <input name="StudentID" placeholder="Student ID" value={formData.StudentID} onChange={handleChange} />
        <input name="FirstName" placeholder="First Name" value={formData.FirstName} onChange={handleChange} />
        <input name="LastName" placeholder="Last Name" value={formData.LastName} onChange={handleChange} />
        <input name="Grade" placeholder="Grade" value={formData.Grade} onChange={handleChange} />

        <select name="SchoolID" value={formData.SchoolID} onChange={handleChange}>
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        {isAdmin && (
          <>
            <input name="StudentPhone" placeholder="Student Phone" value={formData.StudentPhone} onChange={handleChange} />
            <input name="GuardianName" placeholder="Guardian Name" value={formData.GuardianName} onChange={handleChange} />
            <input name="GuardianPhone" placeholder="Guardian Phone" value={formData.GuardianPhone} onChange={handleChange} />
            <input name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />
          </>
        )}

        <select name="STEMInterest" value={formData.STEMInterest} onChange={handleChange}>
          <option value="">STEM Interest?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <input type="date" name="EnrollmentDate" value={formData.EnrollmentDate} onChange={handleChange} />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleAdd}>➕ Add</button>
          <button onClick={handleUpdate}>✏️ Update</button>
          {isAdmin && <button onClick={handleDelete}>🗑 Delete</button>}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>STEM</th>
            <th>Enroll Date</th>
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
