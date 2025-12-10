import React, { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("EDUDB_admin");  // pre-filled so you don't mistype
  const [password, setPassword] = useState("EduScholarsDB25");     // pre-filled
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const response = await fetch("https://scholartrack-backend-7vzy.onrender.com", {
        method: "POST",
        credentials: "include",  // 🔥 REQUIRED for cookies
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("https://scholartrack-backend-7vzy.onrender.com/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setMessage("SUCCESS! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";  // change "/dashboard" to your actual route
        }, 1000);
      } else {
        setMessage(data.error || "Wrong username/password");
      }
    } catch (err) {
      setMessage("Server error — trying again in 3s...");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>ScholarTrack Login</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 30 }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: 300, padding: 12, fontSize: 16 }}
          required
        />
        <br /><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: 300, padding: 12, fontSize: 16 }}
          required
        />
        <br /><br />
        <button type="submit" style={{ padding: "12px 40px", background: "#2e8b57", color: "white", border: "none", fontSize: 16 }}>
          LOGIN NOW
        </button>
      </form>

      <p style={{ marginTop: 20, fontWeight: "bold", color: message.includes("SUCCESS") ? "green" : "red" }}>
        {message || "Use EDUDB_admin / admin123"}
      </p>
    </div>
  );
}

export default Login;

