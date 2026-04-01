import React, { useState } from "react";
import API_BASE from "../apiConfig";
import logo from "../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const LOGIN_URL = `${API_BASE}/login/`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        credentials: "include",   // VERY IMPORTANT FOR COOKIES
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (res.ok) {
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
      } else {
        setMessage(data.error || "Wrong username/password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error, try again.");
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="ScholarTrack Logo" style={{ width: "120px", marginBottom: "20px" }} />
      <h1 style={{ marginTop: 0 }}>ScholarTrack Login</h1>
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
