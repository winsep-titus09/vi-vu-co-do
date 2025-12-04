import { useState, useEffect, useMemo, useCallback } from "react";
import { reviewsApi, adminReviewsApi } from "./api";

// ============================================================================
// PUBLIC HOOKS - For tourists/users
// ============================================================================

/**
 * Hook to fetch tour reviews with pagination
 */
export function useTourReviews(tourId, params = {}) {
  const [data, setData] = useState({ reviews: [], total: 0, page: 1, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify({ tourId, ...params }), [tourId, params]);

  const refetch = useCallback(async () => {
    if (!tourId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.listTourReviews(tourId, params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải đánh giá tour");
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

/**
 * Hook to fetch guide reviews with pagination
 */
export function useGuideReviews(guideId, params = {}) {
  const [data, setData] = useState({ reviews: [], total: 0, page: 1, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify({ guideId, ...params }), [guideId, params]);

  const refetch = useCallback(async () => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.listGuideReviews(guideId, params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải đánh giá hướng dẫn viên");
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

/**
 * Hook to fetch location reviews with pagination
 */
export function useLocationReviews(locationId, params = {}) {
  const [data, setData] = useState({ reviews: [], total: 0, page: 1, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify({ locationId, ...params }), [locationId, params]);

  const refetch = useCallback(async () => {
    if (!locationId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.listLocationReviews(locationId, params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải đánh giá địa điểm");
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

/**
 * Hook to get tour rating statistics
 */
export function useTourRatingStats(tourId) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tourId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await reviewsApi.getTourRatingStats(tourId);
        if (isMounted) setStats(response);
      } catch (err) {
        if (isMounted) setError(err.message || "Không thể tải thống kê");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [tourId]);

  return { stats, isLoading, error };
}

/**
 * Hook to get guide rating statistics
 */
export function useGuideRatingStats(guideId) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await reviewsApi.getGuideRatingStats(guideId);
        if (isMounted) setStats(response);
      } catch (err) {
        if (isMounted) setError(err.message || "Không thể tải thống kê");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [guideId]);

  return { stats, isLoading, error };
}

/**
 * Hook to create reviews (tour, guide, location)
 */
export function useCreateReview() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTourReview = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.createTourReview(data);
      return { success: true, data: response };
    } catch (err) {
      const message = err.message || "Không thể gửi đánh giá tour";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGuideReview = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.createGuideReview(data);
      return { success: true, data: response };
    } catch (err) {
      const message = err.message || "Không thể gửi đánh giá hướng dẫn viên";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLocationReview = useCallback(async (locationId, data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reviewsApi.createLocationReview(locationId, data);
      return { success: true, data: response };
    } catch (err) {
      const message = err.message || "Không thể gửi đánh giá địa điểm";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createTourReview, createGuideReview, createLocationReview, isLoading, error };
}

/**
 * Hook to get review for a specific booking
 */
export function useBookingReview(bookingId) {
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchReview() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await reviewsApi.getReviewForBooking(bookingId);
        if (isMounted) setReview(response);
      } catch (err) {
        // 404 means no review exists yet, not an error
        if (err.status !== 404) {
          if (isMounted) setError(err.message || "Không thể tải đánh giá");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchReview();
    return () => { isMounted = false; };
  }, [bookingId]);

  return { review, isLoading, error };
}

// ============================================================================
// ADMIN HOOKS
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
