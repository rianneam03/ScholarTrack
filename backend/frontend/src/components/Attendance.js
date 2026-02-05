import { useEffect, useState } from "react";
import axios from "axios";

function Attendance({ selectedSession }) {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!selectedSession) return;

    fetchAttendance();
    fetchStudentsForSchool();
    setLocked(selectedSession.is_locked);
  }, [selectedSession]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("/api/attendance/");
      setAttendance(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    }
  };

  const fetchStudentsForSchool = async () => {
    try {
      const res = await axios.get(
        `/api/schools/${selectedSession.school_id}/students/`
      );
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  const handleAttendanceChange = async (studentId, present) => {
    if (locked) return;

    try {
      await axios.post("/api/attendance/", {
        session_id: selectedSession.id,
        student_id: studentId,
        present,
      });

      fetchAttendance();
    } catch (err) {
      console.error("Error updating attendance", err);
    }
  };

  /**
   * 🔑 THIS IS THE IMPORTANT FIX
   */
  const filteredAttendance = attendance.filter(
    (a) =>
      a.session_id === selectedSession.id &&
      a.student.school_id === selectedSession.school_id
  );

  return (
    <div>
      <h2>Attendance</h2>

      {locked && <p style={{ color: "red" }}>Attendance is locked</p>}

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const record = filteredAttendance.find(
              (a) => a.student.id === student.id
            );

            return (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={record ? record.present : false}
                    disabled={locked}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.checked)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={() =>
          window.open(
            `/attendance/export/?session_id=${selectedSession.id}`,
            "_blank"
          )
        }
      >
        Export Attendance
      </button>
    </div>
  );
}

export default Attendance;
