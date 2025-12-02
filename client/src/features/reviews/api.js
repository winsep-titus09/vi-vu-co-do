import apiClient from "../../lib/api-client";

// ============================================================================
// REVIEWS API FUNCTIONS
// ============================================================================

export const reviewsApi = {
  // List tour reviews (public)
  listTourReviews: async (tourId, params = {}) => {
    const response = await apiClient.get(`/reviews/tours/${tourId}`, {
      params,
    });
    return response;
  },

  // List guide reviews (public)
  listGuideReviews: async (guideId, params = {}) => {
    const response = await apiClient.get(`/reviews/guides/${guideId}`, {
      params,
    });
    return response;
  },

  // Get tour rating stats (public)
  getTourRatingStats: async (tourId) => {
    const response = await apiClient.get(`/reviews/tours/${tourId}/stats`);
    return response;
  },

  // Get guide rating stats (public)
  getGuideRatingStats: async (guideId) => {
    const response = await apiClient.get(`/reviews/guides/${guideId}/stats`);
    return response;
  },

  // Create tour review (auth required)
  createTourReview: async (data) => {
    const response = await apiClient.post("/reviews/tour", data);
    return response;
  },

  // Create guide review (auth required)
  createGuideReview: async (data) => {
    const response = await apiClient.post("/reviews/guide", data);
    return response;
  },

  // Get review for booking (auth required)
  getReviewForBooking: async (bookingId) => {
    const response = await apiClient.get(`/reviews/bookings/${bookingId}`);
    return response;
  },

  // ============================================================================
  // LOCATION REVIEWS
  // ============================================================================

  // List location reviews (public)
  listLocationReviews: async (locationId, params = {}) => {
    const response = await apiClient.get(`/reviews/locations/${locationId}`, {
      params,
    });
    return response;
  },

  // Get location rating stats (public)
  getLocationRatingStats: async (locationId) => {
    const response = await apiClient.get(
      `/reviews/locations/${locationId}/stats`
    );
    return response;
  },

  // Create location review (auth required)
  createLocationReview: async (locationId, data) => {
    const response = await apiClient.post(
      `/reviews/locations/${locationId}`,
      data
    );
    return response;
  },
};

// ============================================================================
// ADMIN REVIEWS API FUNCTIONS
// ============================================================================

export const adminReviewsApi = {
  // List all reviews with filters
  listReviews: async (params = {}) => {
    const response = await apiClient.get("/admin/reviews", { params });
    return response;
  },

  // Get review statistics
  getStats: async () => {
    const response = await apiClient.get("/admin/reviews/stats");
    return response;
  },

  // Update review status
  updateStatus: async (id, data) => {
    const response = await apiClient.put(`/admin/reviews/${id}/status`, data);
    return response;
  },

  // Delete review permanently
  deleteReview: async (id) => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    return response;
  },
};
