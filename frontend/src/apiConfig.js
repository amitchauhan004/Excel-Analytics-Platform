const rawUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;

export default API_BASE_URL;
