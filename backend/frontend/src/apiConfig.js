// Use process.env for the API URL, falling back to localhost during development
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
export default API_BASE;