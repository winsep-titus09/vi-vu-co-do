import apiClient from "../../lib/api-client";

// ============================================================================
// USER PREFERENCES API FUNCTIONS (for current user)
// ============================================================================

export const userPreferencesApi = {
  // Get current user preferences
  getPreferences: async () => {
    const response = await apiClient.get("/users/me/preferences");
    return response;
  },

  // Update current user preferences
  updatePreferences: async (data) => {
    const response = await apiClient.put("/users/me/preferences", data);
    return response;
  },

  // Update notification settings
  updateNotifications: async (notifications) => {
    const response = await apiClient.put("/users/me/preferences", {
      notifications,
    });
    return response;
  },

  // Update display settings
  updateDisplay: async (display) => {
    const response = await apiClient.put("/users/me/preferences", { display });
    return response;
  },
};

// ============================================================================
// USER DELETE ACCOUNT API FUNCTIONS
// ============================================================================

export const userDeleteApi = {
  // Get delete request status
  getDeleteRequestStatus: async () => {
    const response = await apiClient.get("/users/me/delete-request");
    return response;
  },

  // Request account deletion
  requestDelete: async (reason = "") => {
    const response = await apiClient.post("/users/me/delete-request", {
      reason,
    });
    return response;
  },

  // Cancel delete request
  cancelDeleteRequest: async () => {
    const response = await apiClient.delete("/users/me/delete-request");
    return response;
  },
};

// ============================================================================
// ADMIN USERS API FUNCTIONS
// ============================================================================

export const adminUsersApi = {
  // List users with filters
  listUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params });
    return response;
  },

  // Get user statistics
  getStats: async () => {
    const response = await apiClient.get("/admin/users/stats");
    return response;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response;
  },

  // Update user status (active/banned)
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/users/${id}/status`, {
      status,
    });
    return response;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response;
  },

  // List pending delete requests
  listDeleteRequests: async (params = {}) => {
    const response = await apiClient.get("/admin/users/delete-requests", {
      params,
    });
    return response;
  },

  // Approve delete request (delete user)
  approveDeleteRequest: async (id, adminNotes = "") => {
    const response = await apiClient.post(`/admin/users/${id}/approve-delete`, {
      admin_notes: adminNotes,
    });
    return response;
  },

  // Reject delete request
  rejectDeleteRequest: async (id, adminNotes = "") => {
    const response = await apiClient.post(`/admin/users/${id}/reject-delete`, {
      admin_notes: adminNotes,
    });
    return response;
  },
};

// ============================================================================
// ADMIN GUIDE APPLICATIONS API FUNCTIONS
// ============================================================================

export const adminGuideAppApi = {
  // List guide applications
  listApplications: async (params = {}) => {
    const response = await apiClient.get("/admin/guide-applications", {
      params,
    });
    return response;
  },

  // Get application by ID
  getApplicationById: async (id) => {
    const response = await apiClient.get(`/admin/guide-applications/${id}`);
    return response;
  },

  // Review application (approve/reject)
  reviewApplication: async (id, data) => {
    const response = await apiClient.patch(
      `/admin/guide-applications/${id}/status`,
      data
    );
    return response;
  },
};
