const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/karigar-backend";

export const API_ENDPOINTS = {
  // Workers
  REGISTER_WORKER: `${API_BASE_URL}/api/workers/register`,
  GET_WORKERS: `${API_BASE_URL}/api/workers`,
  
  // Auth — links Auth0 user to app_users (see AuthSyncServlet)
  AUTH_SYNC: `${API_BASE_URL}/api/auth/sync`,
  
  // Bookings
  CREATE_BOOKING: `${API_BASE_URL}/api/bookings/create`,
  GET_BOOKINGS: `${API_BASE_URL}/api/bookings`,
  UPDATE_BOOKING_STATUS: `${API_BASE_URL}/api/bookings/status`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
