import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Decode JWT payload without verifying signature (client-side only)
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // convert to ms
  } catch {
    return null;
  }
};

// Silently refresh the access token
const refreshAccessToken = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user?.refreshToken) {
    sessionStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('No refresh token');
  }

  const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {
    refreshToken: user.refreshToken,
  });

  user.token = data.token;
  sessionStorage.setItem('user', JSON.stringify(user));
  return data.token;
};

// Request interceptor — proactively refresh if token expires within 10s
api.interceptors.request.use(
  async (config) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user?.token) return config;

    const expiry = getTokenExpiry(user.token);
    const expiresInMs = expiry ? expiry - Date.now() : null;

    // Token expired or expires within 10 seconds — refresh before sending
    if (expiresInMs !== null && expiresInMs < 10_000) {
      if (isRefreshing) {
        // Wait for the in-flight refresh to finish
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        config.headers.Authorization = 'Bearer ' + newToken;
        return config;
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        config.headers.Authorization = 'Bearer ' + newToken;
      } catch (err) {
        processQueue(err, null);
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    } else {
      config.headers.Authorization = 'Bearer ' + user.token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — fallback for any 401 that still slips through
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept login errors
      if (originalRequest.url === '/auth/login') return Promise.reject(error);

      // Refresh endpoint itself failed — log out
      if (originalRequest.url === '/auth/refresh') {
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = 'Bearer ' + newToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
