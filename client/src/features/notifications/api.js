// client/src/features/notifications/api.js
import apiClient from "../../lib/api-client";

// ============================================================================
// USER NOTIFICATIONS API FUNCTIONS
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

// ============================================================================
// ADMIN NOTIFICATIONS API FUNCTIONS
// ============================================================================

export const adminNotificationsApi = {
  // Send broadcast notification to users
  sendBroadcast: async (data) => {
    const response = await apiClient.post(
      "/admin/notifications/broadcast",
      data
    );
    return response;
  },

  // Get broadcast history
  getHistory: async (params = {}) => {
    const response = await apiClient.get("/admin/notifications/history", {
      params,
    });
    return response;
  },

  // Get notification statistics (audience counts, etc.)
  getStats: async () => {
    const response = await apiClient.get("/admin/notifications/stats");
    return response;
  },

  // Get admin notifications
  getAdminNotifications: async (params = {}) => {
    const response = await apiClient.get("/admin/notifications", { params });
    return response;
  },

  // Mark admin notification as read
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/admin/notifications/${id}/read`);
    return response;
  },

  // Mark all admin notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch("/admin/notifications/read-all");
    return response;
  },
};

export default notificationsApi;
