// client/src/features/public/api.js
import apiClient from "../../lib/api-client";

export const publicApi = {
  // Get public stats for homepage
  getStats: async () => {
    const response = await apiClient.get("/public/stats");
    return response;
  },
};

export default publicApi;
