const API_BASE = process.env.REACT_APP_API_URL || (
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000/api" 
    : "https://scholartrack-backend-bgas.onrender.com/api"
);

export default API_BASE;