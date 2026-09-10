import apiClient, { unwrapResponse } from './apiClient';

export const repositoryApi = {
  getRepositories: async () => {
    const response = await apiClient.get('/repositories');
    return unwrapResponse(response);
  },

  getRepository: async (repoId) => {
    const response = await apiClient.get(`/repositories/${repoId}`);
    return unwrapResponse(response);
  },

  getLatestScan: async (repoId) => {
    const response = await apiClient.get(`/repositories/${repoId}/scans/latest`);
    return unwrapResponse(response);
  },

  getFiles: async (repoId) => {
    const response = await apiClient.get(`/repositories/${repoId}/files`);
    return unwrapResponse(response);
  },

  getIssues: async (repoId, params = {}) => {
    const response = await apiClient.get(`/repositories/${repoId}/issues`, { params });
    return unwrapResponse(response);
  },

  getRecommendations: async (repoId) => {
    const response = await apiClient.get(`/repositories/${repoId}/recommendations`);
    return unwrapResponse(response);
  }
};
