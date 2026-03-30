import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sessions from "./Sessions";
import Students from "./Students";

function ProgramDashboard() {
  const { programYearId } = useParams();
  const navigate = useNavigate();
  const [programYear, setProgramYear] = useState(null);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState("sessions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Username: JSON.parse(localStorage.getItem("user"))?.username };
        const [pyRes, staffRes] = await Promise.all([
          axios.get(`https://scholartrack-backend-bgas.onrender.com/api/program_years/${programYearId}/`, { headers }),
          axios.get(`https://scholartrack-backend-bgas.onrender.com/api/program-staff/`, { headers })
        ]);
        setProgramYear(pyRes.data);
        setStaff(staffRes.data.filter(s => String(s.program_year_id) === String(programYearId)));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [programYearId]);

  if (loading) return <div className="page-container">Loading Program Dashboard...</div>;
  if (!programYear) return <div className="page-container">Program not found.</div>;

  return (
    <div className="page-container">
      <button className="secondary-btn" onClick={() => navigate("/programs")} style={{ marginBottom: "20px" }}>
        ← Back to all Programs
      </button>

      <div className="card glass-card" style={{ marginBottom: "30px" }}>
        <div className="status-row">
          <div>
            <h2 style={{ margin: 0, border: "none" }}>{programYear.program_name} {programYear.year}</h2>
            <p style={{ margin: "5px 0", color: "var(--text-secondary)" }}>
              {programYear.start_date} to {programYear.end_date}
            </p>
          </div>
          <div className="price-tag" style={{ background: "var(--teal-soft)", color: "var(--teal)", padding: "10px 20px", borderRadius: "10px", fontWeight: "700" }}>
            {programYear.is_paid ? `$${programYear.price}` : "Free Program"}
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === "sessions" ? "tab-btn active" : "tab-btn"} 
          onClick={() => setActiveTab("sessions")}
        >
          Sessions
        </button>
        <button 
          className={activeTab === "enrollments" ? "tab-btn active" : "tab-btn"} 
          onClick={() => setActiveTab("enrollments")}
        >
          Enrolled Students
        </button>
        <button 
          className={activeTab === "staff" ? "tab-btn active" : "tab-btn"} 
          onClick={() => setActiveTab("staff")}
        >
          Assigned Staff
        </button>
      </div>

      <div className="tab-content transition-fade">
        {activeTab === "sessions" && (
          <Sessions filterProgramYearId={programYearId} isCompact={true} />
        )}
        {activeTab === "enrollments" && (
          <Students filterProgramYearId={programYearId} isCompact={true} />
        )}
        {activeTab === "staff" && (
          <div className="card glass-card">
            <h3>Assigned Instructors</h3>
            <p className="helper-text" style={{marginBottom: "15px"}}>These staff members have access to mark attendance for this program.</p>
            <table>
              <thead><tr><th>Instructor Name</th><th>Role</th></tr></thead>
              <tbody>
                {staff.length > 0 ? staff.map(s => (
                  <tr key={s.assignmentid}>
                    <td>{s.fullname}</td>
                    <td>{s.role || "Teacher"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="2">No staff assigned yet.</td></tr>
                )}
              </tbody>
            </table>
            <button className="secondary-btn" style={{marginTop: "15px"}} onClick={() => navigate("/programs")}>
              Manage Access in Main Programs View
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramDashboard;
