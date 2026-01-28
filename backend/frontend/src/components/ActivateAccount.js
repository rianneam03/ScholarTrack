import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/activate/",
        {
          token,
          username,
          password,
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Activation failed. Please check your link."
      );
    }
  };

  return (
    <div>
      <h2>Activate Your Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Account activated!</p>}

      {!success && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">Activate Account</button>
        </form>
      )}
    </div>
  );
};

export default ActivateAccount;
