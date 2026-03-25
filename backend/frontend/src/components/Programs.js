import { useState, useEffect } from "react";
import axios from "axios";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [programYears, setProgramYears] = useState([]);
  const [staffAssignments, setStaffAssignments] = useState([]);
  const [users, setUsers] = useState([]);

  // Form states
  const [newProgram, setNewProgram] = useState({ name: "", description: "" });
  const [newProgramYear, setNewProgramYear] = useState({ program_id: "", year: new Date().getFullYear(), start_date: "", end_date: "" });
  const [newAssignment, setNewAssignment] = useState({ program_year_id: "", userid: "" });

  const [message, setMessage] = useState({ text: "", type: "" });
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const username = currentUser?.username;
  const role = currentUser?.role;

  const fetchData = async () => {
    try {
      const headers = { Username: username };
      const [progRes, yearRes, staffRes] = await Promise.all([
        axios.get("https://scholartrack-backend-bgas.onrender.com/api/programs/", { headers }),
        axios.get("https://scholartrack-backend-bgas.onrender.com/api/program_years/", { headers }),
        axios.get("https://scholartrack-backend-bgas.onrender.com/api/program-staff/", { headers })
      ]);
      setPrograms(progRes.data);
      setProgramYears(yearRes.data);
      setStaffAssignments(staffRes.data);

      if (role === "admin") {
        const userRes = await axios.get("https://scholartrack-backend-bgas.onrender.com/api/users/", { headers });
        setUsers(userRes.data.filter(u => u.role === "teacher" || u.role === "admin"));
      }
    } catch (err) {
      console.error("Error loading program data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleCreateProgram = async () => {
    if (!newProgram.name) return showMessage("Program name required", "error");
    try {
      await axios.post("https://scholartrack-backend-bgas.onrender.com/api/programs/", newProgram, { headers: { Username: username }});
      showMessage("Program created successfully!");
      setNewProgram({ name: "", description: "" });
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || "Error creating Program", "error");
    }
  };

  const handleCreateProgramYear = async () => {
    if (!newProgramYear.program_id || !newProgramYear.year) return showMessage("Program and Year required", "error");
    try {
      await axios.post("https://scholartrack-backend-bgas.onrender.com/api/program_years/", newProgramYear, { headers: { Username: username }});
      showMessage("Program Year created successfully!");
      setNewProgramYear({ ...newProgramYear, start_date: "", end_date: "" });
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || "Error creating Program Year", "error");
    }
  };

  const handleAssignStaff = async () => {
    if (!newAssignment.program_year_id || !newAssignment.userid) return showMessage("Program Year and User required", "error");
    try {
      await axios.post("https://scholartrack-backend-bgas.onrender.com/api/program-staff/", newAssignment, { headers: { Username: username }});
      showMessage("Staff assigned successfully!");
      setNewAssignment({ program_year_id: "", userid: "" });
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || "Error assigning staff", "error");
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await axios.delete(`https://scholartrack-backend-bgas.onrender.com/api/program-staff/${id}/`, { headers: { Username: username }});
      fetchData();
    } catch (err) {
      showMessage("Error removing staff", "error");
    }
  };

  if (role === "teacher") {
    const myAssignments = staffAssignments.filter(sa => sa.username === username);
    return (
      <div className="page-container">
        <h2>My Assigned Programs</h2>
        <div className="card">
          <table>
            <thead><tr><th>Program Name</th><th>Year</th></tr></thead>
            <tbody>
              {myAssignments.length === 0 ? (
                <tr><td colSpan="2">No programs assigned.</td></tr>
              ) : (
                myAssignments.map(sa => (
                  <tr key={sa.assignmentid}>
                    <td>{sa.program_name || 'N/A'}</td>
                    <td>{sa.year || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Program Management</h2>
      {message.text && (
        <div className={`helper-text`} style={{ color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontWeight: 'bold' }}>
          {message.text}
        </div>
      )}

      {/* PROGRAMS */}
      <div className="card">
        <h3>1. Programs (e.g., STEM Afterschool, Summer Camp)</h3>
        <div className="form-container">
          <input placeholder="Program Name" value={newProgram.name} onChange={(e) => setNewProgram({...newProgram, name: e.target.value})} />
          <input placeholder="Description" value={newProgram.description} onChange={(e) => setNewProgram({...newProgram, description: e.target.value})} style={{flex: 2}} />
          <button className="primary" onClick={handleCreateProgram}>Add Program</button>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Description</th></tr></thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.program_id}><td>{p.program_id}</td><td>{p.name}</td><td>{p.description}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROGRAM YEARS */}
      <div className="card">
        <h3>2. Program Academic Years</h3>
        <div className="form-container">
          <select value={newProgramYear.program_id} onChange={(e) => setNewProgramYear({...newProgramYear, program_id: e.target.value})}>
            <option value="">-- Select Program --</option>
            {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Year (e.g. 2026)" value={newProgramYear.year} onChange={(e) => setNewProgramYear({...newProgramYear, year: e.target.value})} />
          <input type="date" title="Start Date" value={newProgramYear.start_date} onChange={(e) => setNewProgramYear({...newProgramYear, start_date: e.target.value})} />
          <input type="date" title="End Date" value={newProgramYear.end_date} onChange={(e) => setNewProgramYear({...newProgramYear, end_date: e.target.value})} />
          <button className="primary" onClick={handleCreateProgramYear}>Create Year</button>
        </div>
        <table>
          <thead><tr><th>Program Name</th><th>Year</th><th>Start Date</th><th>End Date</th></tr></thead>
          <tbody>
            {programYears.map(py => (
              <tr key={py.program_year_id}><td>{py.program_name}</td><td>{py.year}</td><td>{py.start_date}</td><td>{py.end_date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STAFF ASSIGNMENTS */}
      <div className="card">
        <h3>3. Instructor Tracking (Access Grants)</h3>
        <p className="helper-text" style={{marginBottom: "1rem"}}>Assigning a teacher to a Program Year allows them to mark attendance for any session within it.</p>
        <div className="form-container">
          <select value={newAssignment.program_year_id} onChange={(e) => setNewAssignment({...newAssignment, program_year_id: e.target.value})}>
            <option value="">-- Select Program Year --</option>
            {programYears.map(py => <option key={py.program_year_id} value={py.program_year_id}>{py.program_name} ({py.year})</option>)}
          </select>
          <select value={newAssignment.userid} onChange={(e) => setNewAssignment({...newAssignment, userid: e.target.value})}>
            <option value="">-- Select Instructor --</option>
            {users.map(u => <option key={u.username} value={u.userid || u.username}>{u.fullname} ({u.role})</option>)}
          </select>
          <button className="primary" onClick={handleAssignStaff}>Grant Access</button>
        </div>
        <table>
          <thead><tr><th>Program Year</th><th>Instructor</th><th>Action</th></tr></thead>
          <tbody>
            {staffAssignments.map(sa => (
              <tr key={sa.assignmentid}>
                <td>{sa.program_name ? `${sa.program_name} (${sa.year})` : 'N/A'}</td>
                <td>{sa.fullname || 'N/A'}</td>
                <td>
                  <button className="delete" onClick={() => handleDeleteStaff(sa.assignmentid)}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
