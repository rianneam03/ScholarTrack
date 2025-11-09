import React, { useEffect, useState, useMemo } from "react";
import API_BASE from "../apiConfig";

useEffect(() => {
  fetch(`${API_BASE}/api/Attendance/`)
    .then(res => res.json())
    .then(data => setAttendance(data))
    .catch(err => console.error("Error fetching Attendance:", err));
}, []);

function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionID, setSelectedSessionID] = useState("");
  const [selectedSchoolID, setSelectedSchoolID] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [origMap, setOrigMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sessions/")
      .then((r) => r.json())
      .then((data) => setSessions(data))
      .catch((e) => console.error("Sessions load error:", e));
  }, []);

  useEffect(() => {
    if (!selectedSessionID) return;
    const sess = sessions.find((s) => String(s.SessionID) === String(selectedSessionID));
    const schoolId = sess?.SchoolID ? String(sess.SchoolID) : "";
    setSelectedSchoolID(schoolId);

    if (!schoolId) {
      setStudents([]);
      setAttendanceRows([]);
      setOrigMap({});
      return;
    }

    setLoading(true);

    const pStudents = fetch(`http://127.0.0.1:8000/api/students/?school_id=${encodeURIComponent(schoolId)}`)
      .then((r) => r.json());

    const pAttendance = fetch(`http://127.0.0.1:8000/api/attendance/?session_id=${encodeURIComponent(selectedSessionID)}`)
      .then((r) => r.json());

    Promise.all([pStudents, pAttendance])
      .then(([stuData, attData]) => {
        setStudents(stuData || []);
        const map = {};
        (attData || []).forEach((row) => {
          if (row.StudentID) {
            map[String(row.StudentID)] = row.Status || "Absent";
          }
        });
        setOrigMap(map);

        const rows = (stuData || []).map((s) => ({
          StudentID: s.StudentID,
          FirstName: s.FirstName,
          LastName: s.LastName,
          Status: map[String(s.StudentID)] || "Absent",
        }));
        setAttendanceRows(rows);
      })
      .catch((e) => console.error("Load students/attendance error:", e))
      .finally(() => setLoading(false));
  }, [selectedSessionID, sessions]);

  const changeStatus = (studentID, newStatus) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (String(r.StudentID) === String(studentID) ? { ...r, Status: newStatus } : r))
    );
  };

  const saveChanges = async () => {
    if (!selectedSessionID) {
      alert("Please select a session first.");
      return;
    }
    const diffs = attendanceRows.filter((r) => (origMap[String(r.StudentID)] || "Absent") !== r.Status);
    if (diffs.length === 0) {
      alert("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      for (const row of diffs) {
        const res = await fetch("http://127.0.0.1:8000/api/attendance/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            StudentID: row.StudentID,
            SessionID: selectedSessionID,
            Status: row.Status,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to save attendance");
        }
      }
      const fresh = await fetch(`http://127.0.0.1:8000/api/attendance/?session_id=${encodeURIComponent(selectedSessionID)}`).then((r) => r.json());
      const newMap = {};
      (fresh || []).forEach((row) => {
        if (row.StudentID) newMap[String(row.StudentID)] = row.Status || "Absent";
      });
      setOrigMap(newMap);
      alert("✅ Attendance saved.");
    } catch (err) {
      console.error(err);
      alert("❌ Error while saving some records. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance</h2>

      {/* Session picker */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label><strong>Session:&nbsp;</strong></label>
        <select
          value={selectedSessionID}
          onChange={(e) => setSelectedSessionID(e.target.value)}
        >
          <option value="">-- Select Session --</option>
          {sessions.map((s) => (
            <option key={s.SessionID} value={s.SessionID}>
              {s.Title} ({s.SessionDate}) {s.SchoolName ? `— ${s.SchoolName}` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading students & attendance…</div>}

      {!loading && selectedSessionID && (
        <>
          <div style={{ marginBottom: 10 }}>
            <button onClick={saveChanges} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          <table border="1" cellPadding="8" width="100%">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Student</th>
                <th style={{ textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.length > 0 ? (
                attendanceRows.map((row) => (
                  <tr key={row.StudentID}>
                    <td>{row.FirstName} {row.LastName}</td>
                    <td>
                      <select
                        value={row.Status}
                        onChange={(e) => changeStatus(row.StudentID, e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No students found for this session’s school.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {!selectedSessionID && (
        <div style={{ opacity: 0.8 }}>Pick a session to load its students and attendance.</div>
      )}
    </div>
  );
}

export default Attendance;

