import apiClient from "../../lib/api-client";

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export const authApi = {
  // Sign up
  signUp: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    return response;
  },

  // Sign in
  signIn: async (data) => {
    const response = await apiClient.post("/auth/login", data);
    return response;
  },

  // Google Sign in
  googleSignIn: async ({ idToken }) => {
    const response = await apiClient.post("/auth/google", { idToken });
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response;
  },
};
