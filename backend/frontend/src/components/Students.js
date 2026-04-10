import React, { useState } from "react";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../apiAgent";

function Students({ filterProgramYearId, isCompact }) {
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

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: schoolsData } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const res = await api.get("/schools/");
      return res.data;
    }
  });
  const schools = schoolsData || [];

  const fetchStudents = async () => {
    let url = `/students/?page=${page}`;
    if (filterProgramYearId) {
      url = `/enrollments/?program_year_id=${filterProgramYearId}&page=${page}`;
    }
    const res = await api.get(url);
    return res.data;
  };

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['students', page, filterProgramYearId],
    queryFn: fetchStudents,
  });

  const students = React.useMemo(() => {
    if (!studentData) return [];
    let source = studentData.results || studentData;
    if (filterProgramYearId && Array.isArray(source)) {
      source = source.map(e => ({
        ...e,
        StudentID: e.student,
        FirstName: e.student_firstname,
        LastName: e.student_lastname,
        SchoolName: e.program_name
      }));
    }
    if (sortConfig.key) {
      let direction = sortConfig.direction;
      let key = sortConfig.key;
      source = [...source].sort((a, b) => {
        let aVal = a[key] || "";
        let bVal = b[key] || "";
        if (key === "EnrollmentDate") {
          return direction === "asc" ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
        }
        if (key === "StudentID") return direction === "asc" ? Number(aVal.toString().replace(/\D/g, '')) - Number(bVal.toString().replace(/\D/g, '')) : Number(bVal.toString().replace(/\D/g, '')) - Number(aVal.toString().replace(/\D/g, ''));
        return direction === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      });
    }
    return Array.isArray(source) ? source : [];
  }, [studentData, filterProgramYearId, sortConfig]);

  const hasNextPage = studentData?.next !== null && studentData?.next !== undefined;
  const hasPrevPage = studentData?.previous !== null && studentData?.previous !== undefined;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // =======================
  // ➕ ADD STUDENT
  // =======================
  const handleAdd = async () => {
    try {
      await api.post("/students/", formData);
      toast.success("Student added");
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (err) {
      toast.error(err.response?.data?.error || "Add failed");
    }
  };

  // =======================
  // ✏️ UPDATE (PATCH)
  // =======================
  const handleUpdate = async () => {
    if (!formData.StudentID) return toast.info("Student ID required");

    try {
      await api.patch("/students/", formData);
      toast.success("Student updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  // =======================
  // 🗑 DELETE (ADMIN ONLY)
  // =======================
  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!formData.StudentID) return toast.info("Student ID required");
    if (!window.confirm("Delete this student?")) return;

    try {
      const res = await api.delete(`/students/?StudentID=${formData.StudentID}`);
      toast.success(res.data.message || "Student deleted");
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const sortStudents = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // =======================
  // Export Student Data
  // =======================
  const handleExport = async () => {
    try {
      const res = await api.get("/students/export/", { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "students.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export successful!");
    } catch (err) {
      console.error(err);
      toast.error("Error exporting data");
    }
  };

  // =======================
  // Render sort arrows
  // =======================
  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={isCompact ? "" : "page-container"}>
      {!isCompact && <h2>Students</h2>}

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
          {isAdmin && (
            <button className="primary" onClick={handleExport}>
              📥 Export Students
            </button>
)}

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
            <th>STEM Interest</th>
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

      {!isCompact && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px' }}>
          <button 
             className="primary" 
             style={{ padding: "8px 20px" }}
             disabled={!hasPrevPage} 
             onClick={() => setPage(old => Math.max(old - 1, 1))}
          >
             &lt; Previous
          </button>
          <span style={{ padding: '8px', fontWeight: 'bold' }}>Page {page}</span>
          <button 
             className="primary" 
             style={{ padding: "8px 20px" }}
             disabled={!hasNextPage} 
             onClick={() => setPage(old => old + 1)}
          >
             Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default Students;
