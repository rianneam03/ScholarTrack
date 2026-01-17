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

      <p
        className="login-message success|error"
      >
        {message}
      </p>
    </div>
  );
}

export default Login;
