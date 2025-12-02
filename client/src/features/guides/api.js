// src/features/guides/api.js
import apiClient from "../../lib/api-client";

export const guidesApi = {
  // Get featured guides
  getFeaturedGuides: async (limit = 4) => {
    const response = await apiClient.get("/guides/featured", {
      params: { limit },
    });
    return response;
  },

  // Get top rated guides
  getTopRatedGuides: async (limit = 5) => {
    const response = await apiClient.get("/guides/top-rated", {
      params: { limit },
    });
    return response;
  },

  // Get guide profile by ID
  getGuideProfile: async (guideId) => {
    const response = await apiClient.get(`/guides/profile/${guideId}`);
    return response;
  },

  // Get available guides
  getAvailableGuides: async (params = {}) => {
    const response = await apiClient.get("/guides/available", { params });
    return response;
  },

  // Get guide's tours
  getGuideTours: async (guideId, params = {}) => {
    const response = await apiClient.get("/tours", {
      params: {
        ...params,
        guide_id: guideId,
        status: "approved",
      },
    });
    return response;
  },

  // Get guide's busy dates
  getGuideBusyDates: async (guideId, params = {}) => {
    const response = await apiClient.get(`/guides/${guideId}/busy-dates`, {
      params,
    });
    return response;
  },

  // Get guide's reviews
  getGuideReviews: async (guideId, params = {}) => {
    const response = await apiClient.get(`/reviews/guides/${guideId}`, {
      params,
    });
    return response;
  },

  // Get guide's review stats
  getGuideReviewStats: async (guideId) => {
    const response = await apiClient.get(`/reviews/guides/${guideId}/stats`);
    return response;
  },

  // ========== GUIDE DASHBOARD APIs ==========

  // Get guide dashboard stats
  getDashboard: async () => {
    const response = await apiClient.get("/guides/me/dashboard");
    return response;
  },

  // Get guide weekly performance stats
  getWeeklyStats: async () => {
    const response = await apiClient.get("/guides/me/weekly-stats");
    return response;
  },

  // Get guide bookings with filters
  getBookings: async (params = {}) => {
    const { status, page = 1, limit = 50, grouped = false } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      grouped: String(grouped),
    });

    if (status) {
      queryParams.set("status", status);
    }

    const response = await apiClient.get(`/guides/bookings?${queryParams}`);
    return response;
  },

  // Get monthly earnings
  getMonthlyEarnings: async (year) => {
    const queryParams = new URLSearchParams({
      year: String(year || new Date().getFullYear()),
    });
    const response = await apiClient.get(
      `/guides/me/earnings/monthly?${queryParams}`
    );
    return response;
  },

  // Approve booking request
  approveBooking: async (bookingId) => {
    const response = await apiClient.post(`/bookings/${bookingId}/approve`);
    return response;
  },

  // Reject booking request
  rejectBooking: async (bookingId, note) => {
    const response = await apiClient.post(`/bookings/${bookingId}/reject`, {
      note,
    });
    return response;
  },

  // Complete booking
  completeBooking: async (bookingId) => {
    const response = await apiClient.post(`/bookings/${bookingId}/complete`);
    return response;
  },

  // Get single booking by ID
  getBookingById: async (bookingId) => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response;
  },

  // Get my guide profile
  getMyProfile: async () => {
    const response = await apiClient.get("/guides/profile/me");
    return response;
  },

  // Update my guide profile
  updateMyProfile: async (data) => {
    const response = await apiClient.put("/guides/profile/me", data);
    return response;
  },

  // Get my tours (for guide dashboard)
  getMyTours: async (params = {}) => {
    const { status, page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (status && status !== "all") {
      queryParams.set("status", status);
    }

    const response = await apiClient.get(`/guides/me/tours?${queryParams}`);
    return response;
  },

  // Delete tour
  deleteTour: async (tourId) => {
    const response = await apiClient.delete(`/guides/me/tours/${tourId}`);
    return response;
  },

  // ========== TOUR REQUEST APIs ==========

  // Create tour request (guide submits new tour proposal)
  createTourRequest: async (data) => {
    const response = await apiClient.post("/tour-requests", data);
    return response;
  },

  // Update tour request (only pending)
  updateTourRequest: async (requestId, data) => {
    const response = await apiClient.patch(`/tour-requests/${requestId}`, data);
    return response;
  },

  // Get tour request by ID
  getTourRequest: async (requestId) => {
    const response = await apiClient.get(`/tour-requests/${requestId}`);
    return response;
  },

  // Get my tour requests
  getMyTourRequests: async () => {
    const response = await apiClient.get("/tour-requests/mine");
    return response;
  },

  // Delete tour request (only pending)
  deleteTourRequest: async (requestId) => {
    const response = await apiClient.delete(`/tour-requests/${requestId}`);
    return response;
  },

  // ========== TOUR CATEGORIES API ==========

  // Get all tour categories
  getTourCategories: async () => {
    const response = await apiClient.get("/tour-categories");
    return response;
  },

  // ========== LOCATIONS API ==========

  // Get all locations for tour creation
  getLocations: async (params = {}) => {
    const response = await apiClient.get("/locations", { params });
    return response;
  },

  // ========== CALENDAR & SCHEDULE API ==========

  // Get guide calendar (busy dates + bookings)
  getGuideCalendar: async (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await apiClient.get("/guides/calendar", { params });
    return response;
  },

  // Get my busy dates
  getMyBusyDates: async () => {
    const response = await apiClient.get("/guides/busy-dates");
    return response;
  },

  // Add busy dates
  addBusyDates: async (dates, reason) => {
    const response = await apiClient.post("/guides/busy-dates", {
      dates,
      reason,
    });
    return response;
  },

  // Remove busy dates - use POST with _method override since some proxies don't support DELETE with body
  removeBusyDates: async (dates) => {
    // Try DELETE first, fallback to POST if needed
    try {
      const response = await apiClient.request({
        method: "DELETE",
        url: "/guides/busy-dates",
        data: { dates },
      });
      return response;
    } catch (err) {
      console.error("DELETE failed, trying POST fallback:", err);
      // Fallback: use POST with action field
      const response = await apiClient.post("/guides/busy-dates/remove", {
        dates,
      });
      return response;
    }
  },

  // ========== REVIEWS API ==========

  // Get my reviews (as guide)
  getMyReviews: async (params = {}) => {
    const { page = 1, limit = 10, rating = "all" } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (rating && rating !== "all") {
      queryParams.set("rating", rating);
    }
    const response = await apiClient.get(`/guides/me/reviews?${queryParams}`);
    return response;
  },

  // Reply to a review
  replyToReview: async (reviewId, reply) => {
    const response = await apiClient.post(
      `/guides/me/reviews/${reviewId}/reply`,
      {
        reply,
      }
    );
    return response;
  },
};

export default guidesApi;
