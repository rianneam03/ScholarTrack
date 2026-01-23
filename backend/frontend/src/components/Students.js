
  //const user = JSON.parse(localStorage.getItem("user"));
  //const isAdmin = user?.role === "admin";

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

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // TEMPORARY: hardcoded user for local testing
  //const user = { username: "admin", role: "admin" };
  //const isAdmin = true;

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/students/");
    setStudents(await res.json());
  };

  const fetchSchools = async () => {
    const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/schools/");
    setSchools(await res.json());
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // =======================
  // ➕ ADD STUDENT
  // =======================
  const handleAdd = async () => {
    const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/students/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Username: user.username,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Add failed");

    alert("✅ Student added");
    fetchStudents();
  };

  // =======================
  // ✏️ UPDATE (PATCH)
  // =======================
  const handleUpdate = async () => {
    if (!formData.StudentID) return alert("Student ID required");

    const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/students/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Username: user.username,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Update failed");

    alert("✅ Student updated successfully!");
    fetchStudents();
  };

  // =======================
  // 🗑 DELETE (ADMIN ONLY)
  // =======================
  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!formData.StudentID) return alert("Student ID required");
    if (!window.confirm("Delete this student?")) return;

    const res = await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
      {
        method: "DELETE",
        headers: { Username: user.username },
      }
    );

    const data = await res.json();
    alert(data.message || data.error);
    fetchStudents();
  };

  const sortStudents = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";

    const sorted = [...students].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "EnrollmentDate") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (key === "StudentID") return direction === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);

      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setStudents(sorted);
    setSortConfig({ key, direction });
  };

  // =======================
  // Render sort arrows
  // =======================
  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="page-container">
      <h2>Students</h2>

      <div className="form-container">
        <input name="StudentID" placeholder="Student ID" onChange={handleChange} />
        <input name="FirstName" placeholder="First Name" onChange={handleChange} />
        <input name="LastName" placeholder="Last Name" onChange={handleChange} />
        <input name="Grade" placeholder="Grade" onChange={handleChange} />

        <select name="SchoolID" onChange={handleChange}>
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.SchoolID} value={s.SchoolID}>
              {s.SchoolName}
            </option>
          ))}
        </select>

        <select name="STEMInterest" onChange={handleChange}>
          <option value="">STEM Interest</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <input type="date" name="EnrollmentDate" onChange={handleChange} />

        {isAdmin && (
          <>
            <input name="StudentPhone" placeholder="Student Phone" onChange={handleChange} />
            <input name="GuardianName" placeholder="Guardian Name" onChange={handleChange} />
            <input name="GuardianPhone" placeholder="Guardian Phone" onChange={handleChange} />
            <input name="Email" placeholder="Email" onChange={handleChange} />
          </>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary" onClick={handleAdd}>➕ Add</button>
          <button className="primary" onClick={handleUpdate}>✏️ Update</button>
          {isAdmin && <button className="primary" onClick={handleDelete}>🗑 Delete</button>}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => sortStudents("StudentID")} style={{ cursor: "pointer" }}>
              ID {renderSortArrow("StudentID")}
            </th>
            <th onClick={() => sortStudents("LastName")} style={{ cursor: "pointer" }}>
              Name {renderSortArrow("LastName")}
            </th>
            <th>Grade</th>
            <th>School</th>
            <th>STEM</th>
            <th onClick={() => sortStudents("EnrollmentDate")} style={{ cursor: "pointer" }}>
              Date {renderSortArrow("EnrollmentDate")}
            </th>
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
                  <td>{s.StudentPhone || "-"}</td>
                  <td>{s.GuardianName || "-"}</td>
                  <td>{s.GuardianPhone || "-"}</td>
                  <td>{s.Email || "-"}</td>
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
