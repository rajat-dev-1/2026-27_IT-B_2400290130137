import apiClient, { unwrapResponse } from './apiClient';

export const authApi = {

  
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return unwrapResponse(response);
  },

  refreshAccessToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return unwrapResponse(response);
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return unwrapResponse(response);
  }
};
