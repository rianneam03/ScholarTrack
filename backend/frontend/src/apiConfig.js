const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocal 
  ? "http://localhost:8000/api" 
  : "https://scholartrack-backend-bgas.onrender.com/api";
export default API_BASE;