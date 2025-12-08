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

// ============================================================================
// LOCATION CATEGORIES API
// ============================================================================

export const locationCategoriesApi = {
  // Public list of location categories
  list: async (params = {}) => {
    const response = await apiClient.get("/location-categories", { params });
    // controller returns { data: [...], pagination }
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  },

  // Create new location category (admin)
  create: async (data) => {
    const response = await apiClient.post("/admin/location-categories", data);
    return response;
  },

  // Update location category (admin)
  update: async (id, data) => {
    const response = await apiClient.patch(
      `/admin/location-categories/${id}`,
      data
    );
    return response;
  },

  // Delete location category (admin)
  delete: async (id) => {
    const response = await apiClient.delete(`/admin/location-categories/${id}`);
    return response;
  },
};

// ============================================================================
// ARTICLE CATEGORIES API (admin CRUD + public list)
// ============================================================================

export const articleCategoriesApi = {
  // Public list
  list: async (params = {}) => {
    const response = await apiClient.get("/article-categories", { params });
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  },

  // Admin list
  adminList: async (params = {}) => {
    const response = await apiClient.get("/admin/article-categories", {
      params,
    });
    if (Array.isArray(response?.data)) return response.data;
    return response?.data?.data || [];
  },

  create: async (data) => {
    const response = await apiClient.post("/admin/article-categories", data);
    return response;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(
      `/admin/article-categories/${id}`,
      data
    );
    return response;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/admin/article-categories/${id}`);
    return response;
  },
};
