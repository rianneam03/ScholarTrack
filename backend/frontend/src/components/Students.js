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

  // 🔎 detect if student already exists
  const existingStudent = students.find(
    (s) => s.StudentID === formData.StudentID
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.StudentID) {
      alert("Student ID required");
      return;
    }

    let url = "https://scholartrack-backend-7vzy.onrender.com/api/students/";
    let method = "POST";

    if (existingStudent) {
      if (isAdmin) {
        url = `${url}${formData.StudentID}/`;
        method = "PUT";
      } else if (isStaff) {
        url =
          "https://scholartrack-backend-7vzy.onrender.com/api/students/stem/";
        method = "PATCH";
      }
    }

    const payload = {
      ...formData,
      EnrollmentDate: formData.EnrollmentDate || null,
      STEMInterest: formData.STEMInterest || null,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Save failed");
      return;
    }

    alert(existingStudent ? "Updated" : "Added");
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
  };

  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!formData.StudentID) {
      alert("Enter Student ID");
      return;
    }

    if (!window.confirm("Delete student?")) return;

    await fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/?StudentID=${formData.StudentID}`,
      { method: "DELETE" }
    );

    fetchStudents();
  };

  // 🔐 disable rules
  const staffUpdating = isStaff && existingStudent;

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
          disabled={staffUpdating}
          required
        />

        <input
          name="LastName"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={handleChange}
          disabled={staffUpdating}
          required
        />

        <input
          name="Grade"
          placeholder="Grade"
          value={formData.Grade}
          onChange={handleChange}
          disabled={staffUpdating}
        />

        <select
          name="SchoolID"
          value={formData.SchoolID}
          onChange={handleChange}
          disabled={staffUpdating}
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

        <button type="submit">Add / Update</button>

        {isAdmin && (
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        )}
      </form>
    </div>
  );
}

export default Students;
