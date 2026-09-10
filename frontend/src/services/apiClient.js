import axios from 'axios';

// Validate VITE_API_URL at startup so developers see a clear message early
const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl && import.meta.env.DEV) {
  console.warn(
    '[CodeHealth] VITE_API_URL is not set.\n' +
    'Copy .env.example to .env and set VITE_API_URL to your backend address.\n' +
    'Example: VITE_API_URL=http://localhost:5000/api'
  );
}

// Remove accidental trailing slash to prevent double-slash URLs like /api//auth/me
const API_URL = (rawApiUrl || '').replace(/\/+$/, '');

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach in-memory access token on every request
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401, attempt a single token refresh then retry; on failure clear token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/logout' &&
      originalRequest.url !== '/auth/github/callback'
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
        );

        if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
          setAccessToken(refreshResponse.data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        clearAccessToken();
      }
    }

    return Promise.reject(error);
  }
);

export const unwrapResponse = (response) => {
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || 'Unexpected API response format');
};

export default apiClient;
