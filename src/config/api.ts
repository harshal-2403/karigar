const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/karigar-backend";

export const API_ENDPOINTS = {
  // Workers
  REGISTER_WORKER: `${API_BASE_URL}/api/workers/register`,
  GET_WORKERS: `${API_BASE_URL}/api/workers`,

  // Auth
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,

  // Bookings
  CREATE_BOOKING: `${API_BASE_URL}/api/bookings/create`,
  GET_BOOKINGS: `${API_BASE_URL}/api/bookings`,
  UPDATE_BOOKING_STATUS: `${API_BASE_URL}/api/bookings/status`,

  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
