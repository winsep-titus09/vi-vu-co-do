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

  toggleTourVisibility: async (id) => {
    const response = await apiClient.patch(
      `/admin/tours/${id}/toggle-visibility`
    );
    return response;
  },

  deleteTour: async (id) => {
    const response = await apiClient.delete(`/admin/tours/${id}`);
    return response;
  },

  // ============================================================================
  // ADMIN TOUR EDIT REQUESTS API
  // ============================================================================

  getTourEditRequests: async (params = {}) => {
    const response = await apiClient.get("/admin/tour-edit-requests", {
      params,
    });
    return {
      items: Array.isArray(response?.requests) ? response.requests : [],
      total: Number(response?.total || 0),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || params.limit || 20),
      pendingCount: Number(response?.pendingCount || 0),
    };
  },

  getTourEditRequest: async (id) => {
    const response = await apiClient.get(`/admin/tour-edit-requests/${id}`);
    return response;
  },

  approveTourEditRequest: async (id, data = {}) => {
    const response = await apiClient.patch(
      `/admin/tour-edit-requests/${id}/approve`,
      data
    );
    return response;
  },

  rejectTourEditRequest: async (id, notes = "") => {
    const response = await apiClient.patch(
      `/admin/tour-edit-requests/${id}/reject`,
      { notes }
    );
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

  // ============================================================================
  // ADMIN FINANCE API
  // ============================================================================

  getFinanceStats: async (params = {}) => {
    const response = await apiClient.get("/admin/finance/stats", { params });
    return response || {};
  },

  getFinanceTransactions: async (params = {}) => {
    const response = await apiClient.get("/admin/finance/transactions", {
      params,
    });
    return {
      items: Array.isArray(response?.transactions) ? response.transactions : [],
      total: Number(response?.pagination?.total || 0),
      page: Number(response?.pagination?.page || 1),
      pageSize: Number(response?.pagination?.limit || params.limit || 20),
      totalPages: Number(response?.pagination?.totalPages || 1),
    };
  },

  getFinancePayouts: async (params = {}) => {
    const response = await apiClient.get("/admin/finance/payouts", { params });
    return {
      items: Array.isArray(response?.payouts) ? response.payouts : [],
      total: Number(response?.pagination?.total || 0),
      page: Number(response?.pagination?.page || 1),
      pageSize: Number(response?.pagination?.limit || params.limit || 20),
      totalPages: Number(response?.pagination?.totalPages || 1),
    };
  },

  confirmPayout: async (id, data = {}) => {
    const response = await apiClient.patch(
      `/admin/finance/payouts/${id}/confirm`,
      data
    );
    return response;
  },

  // ============================================================================
  // ADMIN PAYMENT SETTINGS API
  // ============================================================================

  getPaymentSettings: async () => {
    const response = await apiClient.get("/admin/payment-settings");
    return Array.isArray(response) ? response : [];
  },

  updatePaymentSetting: async (gateway, data) => {
    const response = await apiClient.patch(
      `/admin/payment-settings/${gateway}`,
      data
    );
    return response;
  },
};

export default adminApi;
