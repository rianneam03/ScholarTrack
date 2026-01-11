import React, { useEffect, useState } from "react";
import axios from "axios";

function Students() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    grade: "",
    school: "",
    stem_interest: "",
    enrollment_date: "",
  });

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* ================= FETCH DATA ================= */

  const fetchStudents = async () => {
    const res = await axios.get("/api/students/", authHeaders);
    setStudents(res.data);
  };

  const fetchSchools = async () => {
    const res = await axios.get("/api/schools/", authHeaders);
    setSchools(res.data);
  };

  const fetchUserRole = async () => {
    const res = await axios.get("/api/me/", authHeaders);
    setUserRole(res.data.role); // "admin" or "staff"
  };

  useEffect(() => {
    fetchStudents();
    fetchSchools();
    fetchUserRole();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStudent = async () => {
    try {
      await axios.post("/api/students/", formData, authHeaders);
      fetchStudents();
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add student");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      grade: student.grade,
      school: student.school,
      stem_interest: student.stem_interest,
      enrollment_date: student.enrollment_date,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `/api/students/${editingId}/`,
        {
          ...formData,
          updated_at: new Date().toISOString(), // tracked automatically
        },
        authHeaders
      );

      setEditingId(null);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update student");
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      first_name: "",
      last_name: "",
      grade: "",
      school: "",
      stem_interest: "",
      enrollment_date: "",
    });
  };

  /* ================= ROLE LOGIC ================= */

  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";

  const canEditField = (field) => {
    if (isAdmin) return true;
    if (isStaff) return field === "stem_interest";
    return false;
  };

  /* ================= UI ================= */

  return (
    <div>
      <h2>Students</h2>

      {/* ===== ADD / EDIT FORM ===== */}
      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 20 }}>
        <h3>{editingId ? "Edit Student" : "Add Student"}</h3>

        <input
          name="student_id"
          placeholder="Student ID"
          value={formData.student_id}
          onChange={handleChange}
          disabled={editingId !== null} // ID locked on edit
        />

        <input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          disabled={!isAdmin}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          disabled={!isAdmin}
        />

        <input
          name="grade"
          placeholder="Grade"
          value={formData.grade}
          onChange={handleChange}
          disabled={!isAdmin}
        />

        <select
          name="school"
          value={formData.school}
          onChange={handleChange}
          disabled={!isAdmin}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          name="stem_interest"
          placeholder="STEM Interest"
          value={formData.stem_interest}
          onChange={handleChange}
        />

        <input
          type="date"
          name="enrollment_date"
          value={formData.enrollment_date}
          onChange={handleChange}
          disabled={!isAdmin}
        />

        {editingId ? (
          <button onClick={handleUpdate}>Update Student</button>
        ) : (
          <button onClick={handleAddStudent}>Add Student</button>
        )}
      </div>

      {/* ===== STUDENT LIST ===== */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>STEM Interest</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.student_id}</td>
              <td>{s.first_name} {s.last_name}</td>
              <td>{s.grade}</td>
              <td>{s.school_name}</td>
              <td>{s.stem_interest}</td>
              <td>
                {(isAdmin || isStaff) && (
                  <button onClick={() => handleEdit(s)}>Edit</button>
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
