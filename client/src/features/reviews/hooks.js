import { useState, useEffect, useMemo, useCallback } from "react";
import { adminReviewsApi } from "./api";

// ============================================================================
// HOOK: useAdminReviews - Admin list with pagination
// ============================================================================

export function useAdminReviews(params = {}) {
  const [data, setData] = useState({
    reviews: [],
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
      const response = await adminReviewsApi.listReviews(params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đánh giá");
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
// HOOK: useAdminReviewStats - Get review statistics
// ============================================================================

export function useAdminReviewStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminReviewsApi.getStats();
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
// HOOK: useAdminReviewActions - CRUD actions for admin
// ============================================================================

export function useAdminReviewActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (id, status, report_reason = null) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminReviewsApi.updateStatus(id, {
        status,
        report_reason,
      });
      return response;
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminReviewsApi.deleteReview(id);
      return response;
    } catch (err) {
      setError(err.message || "Không thể xóa đánh giá");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateStatus, deleteReview, isLoading, error };
}
