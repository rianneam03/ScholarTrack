import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // token from link
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // NEW: username field
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      // POST token, username, password to backend
      const res = await axios.post(
        "https://scholartrack-backend-7vzy.onrender.com/api/activate/",
        {
          token,
          username,   // <- send username
          password,   // <- send password
        },
        { withCredentials: true }
      );

      setMessage(res.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Activation failed");
    }
  };

  return (
    <div className="card">
      <h2>Activate Your Account</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="primary">
          Activate Account
        </button>
      </form>

      {message && <p className={message.includes("failed") ? "error" : "success"}>{message}</p>}
    </div>
  );
}
