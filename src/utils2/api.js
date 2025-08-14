// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL,
//   withCredentials: true, // Allows cookies to be sent with requests
// });

// // Function to fetch and set the CSRF token
// export const initializeCsrf = async () => {
//   await api.get('/sanctum/csrf-cookie'); // Fetch and set CSRF token cookie
// };

// export default api;

import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;