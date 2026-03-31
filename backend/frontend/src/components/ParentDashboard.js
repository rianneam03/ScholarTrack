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
    <div className="page-container parent-dashboard transition-fade">
      <div className="dashboard-header" style={{marginBottom: '30px'}}>
        <h2 style={{margin: 0, fontSize: '1.8rem'}}>Student Dashboard</h2>
        <p style={{color: 'var(--text-secondary)', margin: '5px 0 0 0'}}>Welcome back, Parent Portal</p>
      </div>

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
                  {/* Profile Card & Stats Header */}
                  <div className="student-profile-card-v5" style={{background: 'var(--navy)', color: 'white', padding: '25px', borderRadius: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div className="profile-info">
                      <h3 style={{margin: 0, fontSize: '1.5rem'}}>{studentSummary.student.FirstName} {studentSummary.student.LastName}</h3>
                      <p style={{opacity: 0.8, margin: '5px 0 0 0'}}>{studentSummary.student.Grade}th Grade • {studentSummary.student.SchoolName}</p>
                    </div>
                    <div className="profile-stats" style={{display: 'flex', gap: '30px'}}>
                      <div className="stat-item" style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700}}>{studentSummary.enrollments.length}</div>
                        <div style={{fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase'}}>Programs</div>
                      </div>
                      <div className="stat-item" style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700}}>{studentSummary.attendance_rate || 0}%</div>
                        <div style={{fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase'}}>Attendance</div>
                      </div>
                      <div className="stat-item" style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700}}>{studentSummary.attendance.length}</div>
                        <div style={{fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase'}}>Sessions</div>
                      </div>
                    </div>
                  </div>

                  <div className="section-header" style={{borderLeft: '4px solid var(--teal)', paddingLeft: '15px', marginBottom: '20px'}}>
                    <h3 style={{margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--navy)'}}>Continue Learning</h3>
                  </div>

                  <div className="continue-learning-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                    {studentSummary.enrollments.map((enr, idx) => (
                      <div key={idx} className="learning-card-v5" style={{background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                        <h4 style={{margin: '0 0 10px 0', color: 'var(--navy)'}}>{enr.ProgramName}</h4>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>
                           <span>Progress</span>
                           <span>{idx === 0 ? '75%' : '40%'}</span>
                        </div>
                        <div style={{height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '15px'}}>
                           <div style={{width: idx === 0 ? '75%' : '40%', height: '100%', background: 'var(--teal)'}}></div>
                        </div>
                        <button style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--teal)', background: 'transparent', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer'}}>View Details</button>
                      </div>
                    ))}
                  </div>

                  <div className="section-header" style={{borderLeft: '4px solid var(--teal)', paddingLeft: '15px', marginBottom: '20px'}}>
                    <h3 style={{margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--navy)'}}>Recent Attendance</h3>
                  </div>
                  <div className="attendance-list-v5" style={{background: 'white', border: '1px solid var(--border)', borderRadius: '15px', padding: '10px'}}>
                    {studentSummary.attendance.length === 0 ? <p style={{padding: '20px'}}>No records found.</p> : (
                       <div className="attendance-rows">
                         {studentSummary.attendance.slice(0, 5).map((att, idx) => (
                           <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: idx === studentSummary.attendance.length - 1 ? 'none' : '1px solid var(--border)'}}>
                             <div>
                               <div style={{fontWeight: 600, color: 'var(--navy)'}}>{att.SessionTitle}</div>
                               <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{att.Date}</div>
                             </div>
                             <span className={`status-badge-v5 ${att.Status.toLowerCase()}`} style={{padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: att.Status === 'Present' ? '#D1FAE5' : '#FEE2E2', color: att.Status === 'Present' ? '#065F46' : '#991B1B'}}>
                               {att.Status}
                             </span>
                           </div>
                         ))}
                       </div>
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
