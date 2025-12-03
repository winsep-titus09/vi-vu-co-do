import { useState, useEffect, useMemo, useCallback } from "react";
import {
  adminUsersApi,
  adminGuideAppApi,
  userPreferencesApi,
  userDeleteApi,
} from "./api";

// ============================================================================
// HOOK: useAdminUsers - Admin list users with pagination
// ============================================================================

export function useAdminUsers(params = {}) {
  const [data, setData] = useState({
    users: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.listUsers(params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, isLoading, error, refetch };
}

// ============================================================================
// HOOK: useAdminUserStats - Get user statistics
// ============================================================================

export function useAdminUserStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.getStats();
      setStats(response);
    } catch (err) {
      setError(err.message || "Không thể tải thống kê");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}

// ============================================================================
// HOOK: useAdminUserActions - CRUD actions for admin
// ============================================================================

export function useAdminUserActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (id, status) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.updateStatus(id, status);
      return response;
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.deleteUser(id);
      return response;
    } catch (err) {
      setError(err.message || "Không thể xóa người dùng");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.getUserById(id);
      return response;
    } catch (err) {
      setError(err.message || "Không thể tải thông tin người dùng");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateStatus, deleteUser, getUserById, isLoading, error };
}

// ============================================================================
// HOOK: useAdminGuideApplications - List pending guide applications
// ============================================================================

export function useAdminGuideApplications(params = {}) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminGuideAppApi.listApplications(params);
      setApplications(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách hồ sơ");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { applications, isLoading, error, refetch };
}

// ============================================================================
// HOOK: useAdminGuideAppActions - Actions for guide applications
// ============================================================================

export function useAdminGuideAppActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reviewApplication = useCallback(async (id, action, adminNotes = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminGuideAppApi.reviewApplication(id, {
        action, // "approve" or "reject"
        admin_notes: adminNotes,
      });
      return response;
    } catch (err) {
      setError(err.message || "Không thể xử lý hồ sơ");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApplicationById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminGuideAppApi.getApplicationById(id);
      return response;
    } catch (err) {
      setError(err.message || "Không thể tải thông tin hồ sơ");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reviewApplication, getApplicationById, isLoading, error };
}

// ============================================================================
// HOOK: useUserPreferences - Get and update user preferences
// ============================================================================

const DEFAULT_PREFERENCES = {
  notifications: {
    booking: true,
    promo: false,
    system: true,
  },
  display: {
    quality_3d: "auto",
    currency: "vnd",
  },
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch preferences on mount
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userPreferencesApi.getPreferences();
      setPreferences(response.preferences || DEFAULT_PREFERENCES);
    } catch (err) {
      console.error("Fetch preferences error:", err);
      // Fallback to localStorage if API fails
      const localPrefs = localStorage.getItem("user_preferences");
      if (localPrefs) {
        try {
          setPreferences(JSON.parse(localPrefs));
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
      setError(err.message || "Không thể tải cài đặt");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (newPrefs) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await userPreferencesApi.updatePreferences(newPrefs);
      setPreferences(response.preferences);
      // Also save to localStorage as backup
      localStorage.setItem(
        "user_preferences",
        JSON.stringify(response.preferences)
      );
      return { success: true };
    } catch (err) {
      console.error("Update preferences error:", err);
      setError(err.message || "Không thể lưu cài đặt");
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update only notifications
  const updateNotifications = useCallback(
    async (notifications) => {
      return updatePreferences({ notifications });
    },
    [updatePreferences]
  );

  // Update only display settings
  const updateDisplay = useCallback(
    async (display) => {
      return updatePreferences({ display });
    },
    [updatePreferences]
  );

  // Toggle a single notification
  const toggleNotification = useCallback(
    async (key) => {
      const newValue = !preferences.notifications[key];
      return updatePreferences({
        notifications: { [key]: newValue },
      });
    },
    [preferences.notifications, updatePreferences]
  );

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    refetch: fetchPreferences,
    updatePreferences,
    updateNotifications,
    updateDisplay,
    toggleNotification,
  };
}

// ============================================================================
// HOOK: useDeleteAccountRequest - Request and manage delete account
// ============================================================================

export function useDeleteAccountRequest() {
  const [deleteRequest, setDeleteRequest] = useState({ status: "none" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current delete request status
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userDeleteApi.getDeleteRequestStatus();
      setDeleteRequest(response.delete_request || { status: "none" });
    } catch (err) {
      console.error("Fetch delete status error:", err);
      setError(err.message || "Không thể tải trạng thái");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Request account deletion
  const requestDelete = useCallback(async (reason = "") => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await userDeleteApi.requestDelete(reason);
      setDeleteRequest(response.delete_request);
      return { success: true, message: response.message };
    } catch (err) {
      console.error("Request delete error:", err);
      setError(err.message || "Không thể gửi yêu cầu");
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Cancel delete request
  const cancelRequest = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await userDeleteApi.cancelDeleteRequest();
      setDeleteRequest({ status: "none" });
      return { success: true };
    } catch (err) {
      console.error("Cancel delete error:", err);
      setError(err.message || "Không thể hủy yêu cầu");
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    deleteRequest,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchStatus,
    requestDelete,
    cancelRequest,
  };
}

// ============================================================================
// HOOK: useAdminDeleteRequests - Admin manage delete requests
// ============================================================================

export function useAdminDeleteRequests(params = {}) {
  const [data, setData] = useState({
    requests: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.listDeleteRequests(params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách yêu cầu xóa");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, isLoading, error, refetch };
}

// ============================================================================
// HOOK: useAdminDeleteRequestActions - Admin actions for delete requests
// ============================================================================

export function useAdminDeleteRequestActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveDelete = useCallback(async (id, adminNotes = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.approveDeleteRequest(id, adminNotes);
      return response;
    } catch (err) {
      setError(err.message || "Không thể xóa tài khoản");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectDelete = useCallback(async (id, adminNotes = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminUsersApi.rejectDeleteRequest(id, adminNotes);
      return response;
    } catch (err) {
      setError(err.message || "Không thể từ chối yêu cầu");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approveDelete, rejectDelete, isLoading, error };
}
