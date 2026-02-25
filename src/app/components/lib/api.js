import axios from 'axios';

const api = axios.create({
  // Use relative path to hit the Next.js rewrites proxy,
  // making request to localhost which proxies to the backend domain
  baseURL: '', 
  withCredentials: true,          // send/receive cookies cross-origin
  headers: { 'Content-Type': 'application/json' },
});


// an interceptor to handle 401 unauthorized responses (e.g., token expiry)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {

        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
