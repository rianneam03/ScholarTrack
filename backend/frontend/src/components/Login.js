import React, { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const LOGIN_URL = "https://scholartrack-backend-7vzy.onrender.com/api/login/";

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
          window.location.href = "/dashboard";
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
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>ScholarTrack Login</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 30 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: 300, padding: 12, fontSize: 16 }}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: 300, padding: 12, fontSize: 16 }}
          required
        />
        <br /><br />
        <button
          type="submit"
          style={{
            padding: "12px 40px",
            //background: "#2e8b57",
            color: "white",
            border: "none",
            //fontSize: 16,
          }}
        >
          LOGIN NOW
        </button>
      </form>

      <p
        style={{
          marginTop: 20,
          fontWeight: "bold",
          color: message.includes("SUCCESS") ? "green" : "red",
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default Login;
