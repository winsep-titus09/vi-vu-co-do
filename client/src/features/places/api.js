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
// 3D MODELS API FUNCTIONS (Public)
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

// ============================================================================
// 3D MODELS ADMIN API FUNCTIONS
// ============================================================================

export const adminModels3dApi = {
  // List all 3D models with pagination
  listModels: async (params = {}) => {
    const response = await apiClient.get("/admin/models3d", { params });
    return response;
  },

  // Create new 3D model
  createModel: async (formData) => {
    const response = await apiClient.post("/admin/models3d", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // Update 3D model
  updateModel: async (id, formData) => {
    const response = await apiClient.put(`/admin/models3d/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // Delete 3D model
  deleteModel: async (id) => {
    const response = await apiClient.delete(`/admin/models3d/${id}`);
    return response;
  },
};
