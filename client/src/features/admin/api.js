import apiClient from "../../lib/api-client";

// ============================================================================
// ADMIN DASHBOARD API
// ============================================================================

export const adminApi = {
  getDashboardSummary: async () => {
    const response = await apiClient.get("/admin/dashboard");
    return response || {};
  },

  getRevenueTrend: async (params = {}) => {
    const response = await apiClient.get("/admin/dashboard/revenue-trend", {
      params,
    });
    return Array.isArray(response) ? response : [];
  },

  getTopTourRevenues: async (params = {}) => {
    const response = await apiClient.get("/admin/revenues/tours/revenues", {
      params,
    });
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    return Array.isArray(response) ? response : [];
  },

  getTourRequests: async (params = {}) => {
    const response = await apiClient.get("/admin/tour-requests", { params });
    return {
      items: Array.isArray(response?.items) ? response.items : [],
      total: Number(response?.total || 0),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || params.limit || 10),
    };
  },

  approveTourRequest: async (id) => {
    const response = await apiClient.patch(
      `/admin/tour-requests/${id}/approve`
    );
    return response;
  },

  rejectTourRequest: async (id, reason = "") => {
    const response = await apiClient.patch(
      `/admin/tour-requests/${id}/reject`,
      { reason }
    );
    return response;
  },

  getPayouts: async (params = {}) => {
    const response = await apiClient.get("/admin/payouts", { params });
    const data = Array.isArray(response?.data) ? response.data : response;
    return Array.isArray(data) ? data : [];
  },

  processPayout: async (id) => {
    const response = await apiClient.patch(`/admin/payouts/${id}/process`);
    return response;
  },

  // ============================================================================
  // ADMIN TOURS API
  // ============================================================================

  getTours: async (params = {}) => {
    const response = await apiClient.get("/admin/tours", { params });
    return {
      items: Array.isArray(response?.items) ? response.items : [],
      total: Number(response?.total || 0),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || params.limit || 20),
      counts: response?.counts || { all: 0, pending: 0, active: 0, hidden: 0 },
    };
  },

  approveTour: async (id) => {
    const response = await apiClient.patch(`/admin/tours/${id}/approve`);
    return response;
  },

  rejectTour: async (id, notes = "") => {
    const response = await apiClient.patch(`/admin/tours/${id}/reject`, {
      notes,
    });
    return response;
  },

  // ============================================================================
  // ADMIN LOCATIONS (PLACES) API
  // ============================================================================

  getLocations: async (params = {}) => {
    const response = await apiClient.get("/locations", { params });
    return Array.isArray(response) ? response : [];
  },

  getLocationCategories: async () => {
    const response = await apiClient.get("/locations/categories");
    return Array.isArray(response) ? response : [];
  },

  createLocation: async (formData) => {
    const response = await apiClient.post("/admin/locations", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  updateLocation: async (id, formData) => {
    const response = await apiClient.patch(`/admin/locations/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  deleteLocation: async (id) => {
    const response = await apiClient.delete(`/admin/locations/${id}`);
    return response;
  },
};

export default adminApi;
