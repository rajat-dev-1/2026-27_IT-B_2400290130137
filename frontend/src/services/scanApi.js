import apiClient, { unwrapResponse } from './apiClient';

export const scanApi = {
  startScan: async (repoId, options = {}) => {
    const response = await apiClient.post(`/repositories/${repoId}/scans`, { force: options.force });
    // Treat 202 as success
    if (response.status === 202 || response.status === 200) {
       if (response.data?.success) {
           return response.data.data;
       }
    }
    return unwrapResponse(response);
  },

  getScanStatus: async (scanId) => {
    const response = await apiClient.get(`/scans/${scanId}`);
    return unwrapResponse(response);
  },

  retryScan: async (scanId) => {
    const response = await apiClient.post(`/scans/${scanId}/retry`, {});
    if (response.status === 202 || response.status === 200) {
      if (response.data?.success) {
          return response.data.data;
      }
   }
   return unwrapResponse(response);
  }
};
