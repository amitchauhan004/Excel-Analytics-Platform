// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://excel-analytics-platform-flame.vercel.app';

// For local development, you can set REACT_APP_API_URL=http://localhost:5000 in your .env file

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  UPDATE_USER: `${API_BASE_URL}/api/auth/update`,
  DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,
  PROFILE_PIC: `${API_BASE_URL}/api/auth/profile-pic`,
  
  // File endpoints
  FILES: `${API_BASE_URL}/api/files`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  DOWNLOAD: `${API_BASE_URL}/api/files/download`,
  
  // Data endpoints
  DATA: `${API_BASE_URL}/api/data`,
  
  // Dashboard endpoints
  DASHBOARD_SUMMARY: `${API_BASE_URL}/api/dashboard/summary`,
  DASHBOARD_ACTIVITY: `${API_BASE_URL}/api/dashboard/activity`,
  DASHBOARD_HISTORY_STATS: `${API_BASE_URL}/api/dashboard/history/stats`,
  DASHBOARD_HISTORY: `${API_BASE_URL}/api/dashboard/history`,
  
  // Admin endpoints
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_DETAIL: `${API_BASE_URL}/api/admin/users`,
  
  // Insights endpoints
  INSIGHTS: `${API_BASE_URL}/api/insights`,
  INSIGHTS_ANALYZE: `${API_BASE_URL}/api/insights`,
};

export default API_BASE_URL;
