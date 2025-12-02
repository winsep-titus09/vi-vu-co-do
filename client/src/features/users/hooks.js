import { useState, useEffect, useMemo, useCallback } from "react";
import { adminUsersApi, adminGuideAppApi } from "./api";

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
