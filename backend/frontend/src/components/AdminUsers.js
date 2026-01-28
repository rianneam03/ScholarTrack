import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    role: "teacher",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://scholartrack-backend-7vzy.onrender.com/api/users/",
        { headers: { Username: username }, withCredentials: true }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(
        "https://scholartrack-backend-7vzy.onrender.com/api/admin/create-user/",
        newUser,
        { headers: { Username: username }, withCredentials: true }
      );

      setMessage({ text: res.data.message, type: "success" });
      fetchUsers();
      setNewUser({ fullname: "", email: "", role: "teacher" });
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Error creating user",
        type: "error",
      });
    }
  };

  return (
    <div className="page-container">
      <h2>Admin - User Management</h2>

      {/* USERS TABLE */}
      <div className="card">
        <h3>Existing Users</h3>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx}>
                <td>{u.fullname}</td>
                <td>{u.username || "—"}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className={u.is_active ? "active" : "inactive"}>
                  {u.is_active ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE USER FORM */}
      <div className="card">
        <h3>Create New User</h3>
        <div className="form-container">
          <input
            name="fullname"
            placeholder="Full Name"
            value={newUser.fullname}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={handleChange}
          />
          <select name="role" value={newUser.role} onChange={handleChange}>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="donor">Donor</option>
          </select>
          <button className="primary" onClick={handleCreate}>
            Create User
          </button>
        </div>

        {message.text && (
          <p className={message.type === "success" ? "success" : "error"}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
