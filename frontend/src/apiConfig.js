const rawUrl = process.env.REACT_APP_API_BASE_URL || 'https://excel-analytics-platform.vercel.app/api/';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;

export default API_BASE_URL;
