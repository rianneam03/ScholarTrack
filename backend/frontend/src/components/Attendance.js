import React, { useEffect, useState } from "react";

function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionID, setSelectedSessionID] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [origMap, setOrigMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  // Load sessions on mount
  useEffect(() => {
    fetch("https://scholartrack-backend-7vzy.onrender.com/api/sessions/")
      .then(r => r.json())
      .then(setSessions)
      .catch(e => console.error("Sessions load error:", e));
  }, []);

  // Load students and attendance when a session is selected
  useEffect(() => {
    if (!selectedSessionID) {
      setStudents([]);
      setAttendanceRows([]);
      setOrigMap({});
      return;
    }

    setLoading(true);
    const selectedSession = sessions.find(s => s.SessionID === selectedSessionID);
    const schoolID = selectedSession?.SchoolID || "";

    const pStudents = fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/students/?school_id=${schoolID}`
    ).then(r => r.json());

    const pAttendance = fetch(
      `https://scholartrack-backend-7vzy.onrender.com/api/attendance/?session_id=${selectedSessionID}`
    ).then(r => r.json());

    Promise.all([pStudents, pAttendance])
      .then(([stuData, attData]) => {
        setStudents(stuData || []);
        const map = {};
        (attData || []).forEach(r => {
          if (r.StudentID) map[r.StudentID] = r.Status || "Absent";
        });
        setOrigMap(map);

        const rows = (stuData || []).map(s => ({
          StudentID: s.StudentID,
          FirstName: s.FirstName,
          LastName: s.LastName,
          Status: map[s.StudentID] || "Absent",
        }));
        setAttendanceRows(rows);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedSessionID, sessions]);

  const changeStatus = (studentID, newStatus) => {
    setAttendanceRows(prev =>
      prev.map(r => (r.StudentID === studentID ? { ...r, Status: newStatus } : r))
    );
  };

  const saveChanges = async () => {
    const diffs = attendanceRows.filter(
      r => (origMap[r.StudentID] || "Absent") !== r.Status
    );
    if (diffs.length === 0) return alert("No changes to save.");

    setSaving(true);
    try {
      for (const row of diffs) {
        const res = await fetch(
          "https://scholartrack-backend-7vzy.onrender.com/api/attendance/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              StudentID: row.StudentID,
              SessionID: selectedSessionID,
              Status: row.Status,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to save");
      }
      alert("✅ Attendance saved.");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving attendance.");
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = async () => {
    try {
      const res = await fetch(
        `https://scholartrack-backend-7vzy.onrender.com/api/attendance/export/?session_id=${selectedSessionID}`,
        { headers: { Username: user.username } }
      );
      if (!res.ok) return alert("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance.xlsx";
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  return (
    <div className="page-container">
      <h2>Attendance</h2>

      <div className="filter-bar">
        <label><strong>Session: </strong></label>
        <select value={selectedSessionID} onChange={e => setSelectedSessionID(e.target.value)}>
          <option value="">-- Select Session --</option>
          {sessions.map(s => (
            <option key={s.SessionID} value={s.SessionID}>
              {s.Title} ({s.SessionDate}) {s.SchoolName ? `— ${s.SchoolName}` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading students & attendance…</div>}

      {!loading && selectedSessionID && (
        <>
          <div className="action-bar">
            <button className="primary" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {isAdmin && (
              <button className="primary" onClick={exportAttendance}>
                📥 Export Attendance
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.length > 0 ? (
                attendanceRows.map(row => {
                  const sess = sessions.find(s => s.SessionID === selectedSessionID);
                  const locked = sess && new Date(sess.SessionDate).getTime() + 7*24*60*60*1000 < Date.now();

                  return (
                    <tr key={row.StudentID}>
                      <td>{row.FirstName} {row.LastName}</td>
                      <td>
                        <select
                          value={row.Status}
                          disabled={locked}
                          onChange={e => changeStatus(row.StudentID, e.target.value)}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="2">No students found for this session’s school.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Attendance;
