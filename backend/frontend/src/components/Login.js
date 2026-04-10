import React, { useState } from "react";
import api from "../apiAgent";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await api.post("/login/", { username, password }, { withCredentials: true });
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setMessage("SUCCESS! Redirecting...");
      setTimeout(() => {
        if (data.role === "parent") {
          window.location.href = "/parent-dashboard";
        } else if (data.role === "teacher") {
          window.location.href = "/teacher-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 800);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Server error, try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <h1>ScholarTrack Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button className="primary"
          type="submit"
        >
          LOGIN NOW
        </button>
      </form>

      <p className={`login-message ${message.includes("SUCCESS") ? "success" : "error"}`}>
        {message}
      </p>
      
    </div>
  );
}

export default Login;
