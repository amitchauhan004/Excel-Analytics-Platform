const rawUrl = process.env.REACT_APP_API_BASE_URL || 'https://excel-analytics-platform-ri430dc1w.vercel.app/api/';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;

export default API_BASE_URL;
