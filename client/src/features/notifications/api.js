// client/src/features/notifications/api.js
import apiClient from "../../lib/api-client";

// ============================================================================
// NOTIFICATIONS API FUNCTIONS
// ============================================================================

export const notificationsApi = {
  // Get user's notifications (requires authentication)
  getMyNotifications: async (params = {}) => {
    const response = await apiClient.get("/notifications", { params });
    return response;
  },

  // Mark notification as read (requires authentication)
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response;
  },

  // Mark all notifications as read (requires authentication)
  markAllAsRead: async () => {
    const response = await apiClient.patch("/notifications/read-all");
    return response;
  },

  // Delete notification (requires authentication)
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response;
  },
};

export default notificationsApi;
