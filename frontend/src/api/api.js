import axios from "axios";

// Base URLs
const PREDICTION_BASE_URL = "https://lifeline3.onrender.com/api";
const AUTH_BASE_URL = "https://lifeline3-1.onrender.com/api";

// Axios instances
const PredictionAPI = axios.create({ baseURL: PREDICTION_BASE_URL });
const AuthAPI = axios.create({ baseURL: AUTH_BASE_URL });

/* ---------------------- AUTH APIs ---------------------- */

export const login = async (credentials) => {
  try {
    const response = await AuthAPI.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("❌ Error during login:", error);
    throw error.response?.data?.error || "Login failed";
  }
};

export const signup = async (userData) => {
  try {
    const response = await AuthAPI.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Error during signup:", error);
    throw error.response?.data?.error || "Signup failed";
  }
};

/* ---------------- DISEASE PREDICTION APIs ---------------- */

export const getSymptoms = async () => {
  try {
    const response = await PredictionAPI.get("/get_symptoms");
    return response.data.symptoms.map((symptom) => ({
      value: symptom,
      label: symptom,
    }));
  } catch (err) {
    console.error("❌ Error in getSymptoms:", err);
    throw err.response?.data?.error || "Failed to fetch symptoms";
  }
};

export const predictDisease = async ({ symptoms, uid }, token) => {
  try {
    const payload = { symptoms, uid }; // ✅ use uid
    const response = await PredictionAPI.post("/predict", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Error in predictDisease:", err);
    throw err.response?.data?.error || "Prediction failed";
  }
};

export const getPredictionHistory = async (email, token) => {
  try {
    const response = await PredictionAPI.get("/history", {
      params: { email },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.history;
  } catch (err) {
    console.error("❌ Error in getPredictionHistory:", err);
    throw err.response?.data?.error || "Failed to fetch history";
  }
};

export const chatWithBot = async (data, token) => {
  try {
    const response = await PredictionAPI.post("/chat", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Error in chatWithBot:", err);
    throw err.response?.data?.error || "Chatbot failed";
  }
};

export const initiateChat = async (patientId, doctorId, token) => {
  return axios.post("/chat/initiate", { patientId, doctorId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getChatRooms = async (token) => {
  return axios.get("/chat/rooms", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMessages = async (roomId, token) => {
  return axios.get(`/chat/messages/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendMessage = async (data, token) => {
  return axios.post("/chat/message", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const API = axios.create({ baseURL: AUTH_BASE_URL });
export default API;
