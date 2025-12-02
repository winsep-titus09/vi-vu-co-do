import apiClient from "../../lib/api-client";

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
