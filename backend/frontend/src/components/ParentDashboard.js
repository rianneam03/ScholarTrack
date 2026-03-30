import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";
import "./ParentDashboard.css"; // We'll create minimal styling

function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for specific student details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  
  // State for programs
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  const fetchWithAuth = async (url, options = {}) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = {
      "Content-Type": "application/json",
      "Username": user?.username || "",
      ...(options.headers || {})
    };
    return fetch(`${API_BASE}${url}`, { ...options, headers });
  };

  useEffect(() => {
    async function initParentData() {
      try {
        const studentRes = await fetchWithAuth("/parents/my-students/");
        if (!studentRes.ok) throw new Error("Failed to load students");
        const studentData = await studentRes.json();
        setStudents(studentData);

        const progRes = await fetchWithAuth("/program_years/");
        if (progRes.ok) {
          const progData = await progRes.json();
          setAvailablePrograms(progData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    initParentData();
  }, []);

  const handleSelectStudent = async (studentId) => {
    setSelectedStudent(studentId);
    setStudentSummary(null);
    try {
      const res = await fetchWithAuth(`/parents/students/${studentId}/summary/`);
      if (res.ok) {
        const data = await res.json();
        setStudentSummary(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollment = async (programYearId) => {
    if (!selectedStudent) return;
    try {
      const res = await fetchWithAuth(`/parents/students/${selectedStudent}/enroll/`, {
        method: "POST",
        body: JSON.stringify({ program_year_id: programYearId })
      });
      const data = await res.json();
      if (res.ok) {
        setEnrollmentStatus(`Successfully enrolled in program!`);
        // Refresh summary
        handleSelectStudent(selectedStudent);
      } else {
        setEnrollmentStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setEnrollmentStatus(`Error: ${err.message}`);
    }
    
    // Clear status message after a few seconds
    setTimeout(() => setEnrollmentStatus(null), 4000);
  };

  if (loading) return <div className="page-container">Loading Parent Portal...</div>;
  if (error) return <div className="page-container">Error: {error}</div>;

  return (
    <div className="page-container parent-dashboard">
      <h2>Welcome to the Parent Portal</h2>
      <p>View your children's progress, attendance, and enroll them in upcoming programs.</p>

      <div className="parent-grid">
        {/* Left Column: My Students */}
        <div className="students-list-panel">
          <h3>My Children</h3>
          {students.length === 0 ? (
             <p>No students associated with your profile found.</p>
          ) : (
             <ul className="student-cards">
               {students.map(s => (
                 <li 
                   key={s.StudentID} 
                   className={selectedStudent === s.StudentID ? "student-card active" : "student-card"}
                   onClick={() => handleSelectStudent(s.StudentID)}
                 >
                   <h4>{s.FirstName} {s.LastName}</h4>
                   <p>Grade: {s.Grade}</p>
                   <p>School: {s.SchoolName}</p>
                 </li>
               ))}
             </ul>
          )}
        </div>

        {/* Right Column: Student Details */}
        <div className="student-details-panel">
           {!selectedStudent ? (
              <div className="select-prompt">Select a student on the left to view details.</div>
           ) : !studentSummary ? (
              <div className="loading-prompt">Loading summary...</div>
           ) : (
              <div className="summary-content">
                 <h3>Academic Summary</h3>
                 
                 <div className="summary-section">
                   <h4>Current Enrollments</h4>
                   {studentSummary.enrollments.length === 0 ? <p>No enrollments.</p> : (
                      <ul>
                        {studentSummary.enrollments.map((enr, idx) => (
                           <li key={idx}><strong>{enr.ProgramName} ({enr.Year})</strong> - Status: {enr.Status}</li>
                        ))}
                      </ul>
                   )}
                 </div>

                 <div className="summary-section">
                   <h4>Attendance Record</h4>
                   {studentSummary.attendance.length === 0 ? <p>No attendance records.</p> : (
                      <table className="parent-table">
                        <thead>
                          <tr>
                            <th>Session</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Activity/Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentSummary.attendance.map((att, idx) => (
                            <tr key={idx}>
                              <td>{att.SessionTitle}</td>
                              <td>{att.Date}</td>
                              <td><span className={`status-badge ${att.Status.toLowerCase()}`}>{att.Status}</span></td>
                              <td style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{att.Notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   )}
                 </div>

                 <div className="summary-section enrollment-section">
                   <h4>Enroll in Program</h4>
                   {enrollmentStatus && <div className="enrollment-status">{enrollmentStatus}</div>}
                   <div className="enrollment-actions">
                     <select id="programSelect" defaultValue="">
                        <option value="" disabled>Select a Program...</option>
                        {availablePrograms.map(p => (
                           <option key={p.program_year_id} value={p.program_year_id}>
                             {p.program.name} ({p.year})
                           </option>
                        ))}
                     </select>
                     <button onClick={() => {
                        const selectEl = document.getElementById("programSelect");
                        if(selectEl.value) handleEnrollment(selectEl.value);
                     }} className="btn-primary">Enroll</button>
                   </div>
                 </div>

              </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
