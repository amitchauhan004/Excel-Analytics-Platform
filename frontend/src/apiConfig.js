const rawUrl = (process.env.REACT_APP_API_BASE_URL || 'https://excel-analytics-platform-pi.vercel.app/api/').trim();

let normalizedUrl = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;
if (!normalizedUrl.endsWith('api/')) {
  normalizedUrl = `${normalizedUrl}api/`;
}

const API_BASE_URL = normalizedUrl;
export default API_BASE_URL;
