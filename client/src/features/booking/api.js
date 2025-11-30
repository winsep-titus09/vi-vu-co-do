// client/src/features/booking/api.js
import apiClient from "../../lib/api-client";

// ============================================================================
// BOOKINGS API FUNCTIONS
// ============================================================================

export const bookingsApi = {
  // Get user's bookings (requires authentication)
  getMyBookings: async (params = {}) => {
    const response = await apiClient.get("/bookings", { params });
    // Extract array from response (handle different response structures)
    return response.bookings || response.data || response || [];
  },

  // Get single booking by ID (requires authentication)
  getBooking: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.booking || response.data || response;
  },

  // Create new booking (requires authentication)
  createBooking: async (data) => {
    const response = await apiClient.post("/bookings", data);
    return response;
  },

  // Cancel booking (requires authentication)
  cancelBooking: async (id, reason) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`, {
      reason,
    });
    return response;
  },
};

export default bookingsApi;
