export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://lifeline3-1.onrender.com" // your Render backend
    : "http://localhost:5000";           // for local dev
