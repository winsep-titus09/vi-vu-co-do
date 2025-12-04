import apiClient from "../../lib/api-client";

// ============================================================================
// TOURS API FUNCTIONS
// ============================================================================

export const toursApi = {
  // Get all tours with filters
  listTours: async (params = {}) => {
    const response = await apiClient.get("/tours", { params });
    return response;
  },

  // Get featured tours
  getFeaturedTours: async (limit = 12) => {
    const response = await apiClient.get("/tours/featured", {
      params: { limit },
    });
    return response;
  },

  // Get tour categories
  getCategories: async () => {
    const response = await apiClient.get("/tours/categories");
    return response;
  },

  // Get top rated tours
  getTopRatedTours: async () => {
    const response = await apiClient.get("/tours/top-rated");
    return response;
  },

  // Get single tour by ID or slug
  getTour: async (token) => {
    const response = await apiClient.get(`/tours/${token}`);
    return response;
  },

  // Get tour calendar
  getTourCalendar: async (tourId, params = {}) => {
    const response = await apiClient.get(`/tours/${tourId}/calendar`, {
      params,
    });
    return response;
  },
  
  // Check availability for a specific date
  checkAvailability: async (tourId, date, guests = 1) => {
    const response = await apiClient.get(`/tours/${tourId}/availability`, {
      params: { date, guests },
    });
    return response;
  },

  // Create tour (auth required)
  createTour: async (data) => {
    const response = await apiClient.post("/tours", data);
    return response;
  },

  // Update tour (auth required)
  updateTour: async (id, data) => {
    const response = await apiClient.patch(`/tours/${id}`, data);
    return response;
  },

  // Delete tour (auth required)
  deleteTour: async (id) => {
    const response = await apiClient.delete(`/tours/${id}`);
    return response;
  },

  // ============================================================================
  // TOUR EDIT REQUESTS (FOR GUIDES)
  // ============================================================================

  // Create edit/delete request
  createEditRequest: async (data) => {
    const response = await apiClient.post("/tour-edit-requests", data);
    return response;
  },

  // Get my edit requests (guide)
  getMyEditRequests: async (params = {}) => {
    const response = await apiClient.get("/tour-edit-requests/my", { params });
    return {
      items: Array.isArray(response?.requests) ? response.requests : [],
      total: Number(response?.total || 0),
      page: Number(response?.page || 1),
      pageSize: Number(response?.pageSize || params.limit || 20),
    };
  },

  // Get single edit request
  getEditRequest: async (id) => {
    const response = await apiClient.get(`/tour-edit-requests/${id}`);
    return response;
  },

  // Cancel edit request
  cancelEditRequest: async (id) => {
    const response = await apiClient.delete(`/tour-edit-requests/${id}`);
    return response;
  },
};
