import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure to match backend port
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if the refresh itself fails
      if (originalRequest.url === '/auth/refresh') {
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user.refreshToken) {
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { 
          refreshToken: user.refreshToken 
        });
        
        user.token = data.token;
        sessionStorage.setItem('user', JSON.stringify(user));
        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
        originalRequest.headers.Authorization = 'Bearer ' + data.token;
        
        processQueue(null, data.token);
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
