const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let rawUrl = (process.env.REACT_APP_API_BASE_URL || '').trim();

if (!rawUrl || (isLocal && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1'))) {
  rawUrl = isLocal ? 'http://localhost:5000/api/' : 'https://excel-analytics-platform-pi.vercel.app/api/';
}

let normalizedUrl = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;
if (!normalizedUrl.endsWith('api/')) {
  normalizedUrl = `${normalizedUrl}api/`;
}

const API_BASE_URL = normalizedUrl;
export default API_BASE_URL;
