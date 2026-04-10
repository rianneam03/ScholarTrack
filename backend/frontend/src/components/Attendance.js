import React, { useEffect, useState, useMemo } from "react";
import api from "../apiAgent";
import { toast } from "react-toastify";

function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionID, setSelectedSessionID] = useState("");
  const [selectedSchoolID, setSelectedSchoolID] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [origMap, setOrigMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---- Auth / role ----
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const searchParams = new URLSearchParams(window.location.search);
  const urlSessionId = searchParams.get("session_id");

  // ======================
  // Load sessions
  // ======================
  useEffect(() => {
    api.get('/sessions/')
      .then((r) => {
        setSessions(r.data);
        if (urlSessionId) setSelectedSessionID(urlSessionId);
      })
      .catch((e) => console.error("Sessions load error:", e));
  }, [urlSessionId, user?.username]);

  // ======================
  // Lock attendance if week ended
  // ======================
  const isLocked = useMemo(() => {
    if (!selectedSessionID) return false;

    const session = sessions.find(
      (s) => String(s.SessionID) === String(selectedSessionID)
    );
    if (!session?.SessionDate) return false;

    const sessionDate = new Date(session.SessionDate);

    const startOfWeek = new Date(sessionDate);
    startOfWeek.setDate(sessionDate.getDate() - sessionDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return new Date() > endOfWeek;
  }, [selectedSessionID, sessions]);

  // ======================
  // Load students + attendance
  // ======================
  useEffect(() => {
    if (!selectedSessionID) return;

    const sess = sessions.find(
      (s) => String(s.SessionID) === String(selectedSessionID)
    );
    const schoolId = sess?.SchoolID ? String(sess.SchoolID) : "";
    setSelectedSchoolID(schoolId);

    const programYearId = sess?.ProgramYearID ? String(sess.ProgramYearID) : "";

    if (!programYearId) {
      setStudents([]);
      setAttendanceRows([]);
      setOrigMap({});
      return;
    }

    setLoading(true);

    const pStudents = api.get(
      `/enrollments/?program_year_id=${encodeURIComponent(programYearId)}`
    ).then((r) => r.data);

    const pAttendance = api.get(
      `/attendance/?session_id=${encodeURIComponent(selectedSessionID)}`
    ).then((r) => r.data);

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
          StudentID: s.student,
          FirstName: s.student_firstname,
          LastName: s.student_lastname,
          Status: map[String(s.student)] || "Absent",
        }));
        setAttendanceRows(rows);
      })
      .catch((e) => console.error("Load students/attendance error:", e))
      .finally(() => setLoading(false));
  }, [selectedSessionID, sessions]);

  // ======================
  // Change status (if not locked)
  // ======================
  const changeStatus = (studentID, newStatus) => {
    if (isLocked) return;
    setAttendanceRows((prev) =>
      prev.map((r) =>
        String(r.StudentID) === String(studentID)
          ? { ...r, Status: newStatus }
          : r
      )
    );
  };

  // ======================
  // Save attendance
  // ======================
  const saveChanges = async () => {
    if (!selectedSessionID) {
      toast.info("Please select a session first.");
      return;
    }

    if (isLocked) {
      toast.warn("Attendance for this session is locked.");
      return;
    }

    const diffs = attendanceRows.filter(
      (r) => (origMap[String(r.StudentID)] || "Absent") !== r.Status
    );

    if (diffs.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      for (const row of diffs) {
        await api.post(`/attendance/`, {
          StudentID: row.StudentID,
          SessionID: selectedSessionID,
          Status: row.Status,
        });
      }

      const fresh = await api.get(
        `/attendance/?session_id=${encodeURIComponent(selectedSessionID)}`
      ).then((r) => r.data);

      const newMap = {};
      (fresh || []).forEach((row) => {
        if (row.StudentID)
          newMap[String(row.StudentID)] = row.Status || "Absent";
      });
      setOrigMap(newMap);

      toast.success("Attendance saved.");
    } catch (err) {
      console.error(err);
      toast.error("Error while saving attendance.");
    } finally {
      setSaving(false);
    }
  };

  // ======================
  // Admin export attendance
  // ======================
  const handleExportAttendance = async () => {
    if (!selectedSessionID) {
      toast.info("Please select a session first.");
      return;
    }

    try {
      const res = await api.get(
        `/attendance/export/?session_id=${selectedSessionID}`, 
        { responseType: 'blob' }
      );

      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export successful!");
    } catch (err) {
      console.error(err);
      toast.error("Error exporting attendance");
    }
  };


  // ======================
  // Render
  // ======================
  return (
    <div className="page-container">
      <h2>Attendance</h2>

      <div className="filter-bar">
        <label><strong>Session:&nbsp;</strong></label>
        <select
          value={selectedSessionID}
          onChange={(e) => setSelectedSessionID(e.target.value)}
        >
          <option value="">-- Select Session --</option>
          {sessions.map((s) => (
            <option key={s.SessionID} value={s.SessionID}>
              {s.Title} ({s.SessionDate}) {s.ProgramName ? `— ${s.ProgramName}` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading students & attendance…</div>}

      {!loading && selectedSessionID && (
        <div className="glass-card">
          <div className="status-row">
            <h3>Attendance Checklist</h3>
            <div className="attendance-legend" style={{display: 'flex', gap: '15px', fontSize: '0.8rem'}}>
              <span>🟢 Present</span>
              <span>🔴 Absent</span>
              <span>🟡 Late</span>
            </div>
          </div>
          <div className="action-bar">
            <button
              className="primary"
              onClick={saveChanges}
              disabled={saving || isLocked}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {isAdmin && (
              <button className="primary" onClick={handleExportAttendance}>
                📥 Export Attendance
              </button>
            )}
          </div>

          {isLocked && (
            <div className="helper-text" style={{ color: "#b00020" }}>
              Attendance for this session is locked because the week has ended.
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.length > 0 ? (
                attendanceRows.map((row) => (
                  <tr key={row.StudentID}>
                    <td>{row.FirstName} {row.LastName}</td>
                    <td>
                      <select
                        className="attendance-select"
                        value={row.Status}
                        disabled={isLocked}
                        onChange={(e) =>
                          changeStatus(row.StudentID, e.target.value)
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">
                    No students enrolled in this session's underlying program.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!selectedSessionID && (
        <div className="helper-text">
          Pick a session to load its students and attendance.
        </div>
      )}
    </div>
  );
}

export default Attendance;
