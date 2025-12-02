// src/features/categories/api.js
import apiClient from "../../lib/api-client";

// ============================================================================
// TOUR CATEGORIES API
// ============================================================================

export const categoriesApi = {
  // Get all tour categories
  list: async (params = {}) => {
    const response = await apiClient.get("/tour-categories", { params });
    return response;
  },

  // Get single category by ID or slug
  get: async (token) => {
    const response = await apiClient.get(`/tour-categories/${token}`);
    return response;
  },

  // Create new category (admin only)
  create: async (data) => {
    const response = await apiClient.post("/tour-categories", data);
    return response;
  },

  // Update category (admin only)
  update: async (id, data) => {
    const response = await apiClient.patch(`/tour-categories/${id}`, data);
    return response;
  },

  // Delete category (admin only)
  delete: async (id, force = false) => {
    const params = force ? { force: "nullify" } : {};
    const response = await apiClient.delete(`/tour-categories/${id}`, {
      params,
    });
    return response;
  },
};
