import axios from 'axios';

const api = axios.create({
  // Use relative path to hit the Next.js rewrites proxy,
  // making request to localhost which proxies to the backend domain
  baseURL: '', 
  withCredentials: true,          // send/receive cookies cross-origin
  headers: { 'Content-Type': 'application/json' },
});

export default api;
