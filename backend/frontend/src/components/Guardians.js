import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../apiConfig";

function Guardians() {
  const [guardians, setGuardians] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  const fetchData = async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        axios.get(`${API_BASE}/parents/guardians/`),
        axios.get(`${API_BASE}/students/`)
      ]);
      setGuardians(gRes.data);
      setStudents(sRes.data);
    } catch (err) {
      console.error("Error fetching guardian data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLink = async () => {
    if (!selectedStudent || !selectedGuardian) return;
    try {
      await axios.post(`${API_BASE}/admin/link-student-guardian/`, {
        student_id: selectedStudent,
        guardian_id: selectedGuardian.guardian_id
      });
      alert("✅ Linked successfully!");
      setShowLinkModal(false);
      fetchData();
    } catch (err) {
      alert("❌ Error linking student");
    }
  };

  if (loading) return <div className="page-container">Loading Guardian Portal...</div>;

  return (
    <div className="page-container">
      <div className="status-row">
        <h2>Guardian Management</h2>
      </div>

      <div className="card glass-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Linked Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guardians.map((g) => (
              <tr key={g.guardian_id}>
                <td>{g.name}</td>
                <td>{g.email}</td>
                <td>{g.phone}</td>
                <td>{g.student_count}</td>
                <td>
                  <button className="primary-btn" onClick={() => { setSelectedGuardian(g); setShowLinkModal(true); }}>
                    Link Student
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3>Link Student to {selectedGuardian?.name}</h3>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.StudentID} value={s.StudentID}>
                  {s.FirstName} {s.LastName} ({s.Grade})
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleLink}>Link</button>
              <button className="secondary-btn" onClick={() => setShowLinkModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Guardians;
