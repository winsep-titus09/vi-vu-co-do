import apiClient from "../../lib/api-client";

// ============================================================================
// PLACES/LOCATIONS API FUNCTIONS
// ============================================================================

export const placesApi = {
  // Get all locations with filters
  listLocations: async (params = {}) => {
    const response = await apiClient.get("/locations", { params });
    return response;
  },

  // Get single location by ID or slug (with 3D models)
  getLocation: async (token) => {
    const response = await apiClient.get(`/locations/${token}`);
    return response;
  },

  // Get all location categories
  listLocationCategories: async () => {
    const response = await apiClient.get("/location-categories");
    return response.data || response;
  },
};

// ============================================================================
// 3D MODELS API FUNCTIONS
// ============================================================================

export const models3dApi = {
  // Get all 3D models with optional filters
  listModels: async (params = {}) => {
    const response = await apiClient.get("/models3d", { params });
    return response;
  },

  // Get single 3D model by ID
  getModel: async (id) => {
    const response = await apiClient.get(`/models3d/${id}`);
    return response;
  },
};
