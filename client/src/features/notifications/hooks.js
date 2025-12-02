// client/src/features/notifications/hooks.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { notificationsApi, adminNotificationsApi } from "./api";

// ============================================================================
// HOOK: useNotifications - Get user's notifications
// ============================================================================

export function useNotifications(params = {}) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationsApi.getMyNotifications(params);
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải thông báo");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

// ============================================================================
// HOOK: useAdminNotificationStats - Get notification statistics
// ============================================================================

export function useAdminNotificationStats() {
  const [stats, setStats] = useState({
    audienceCounts: { all: 0, tourist: 0, guide: 0 },
    broadcastStats: { totalSent: 0, lastSentAt: null, lastTitle: null },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminNotificationsApi.getStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      // Silently fail - keep default stats
      setError(err.message || "Không thể tải thống kê");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// ============================================================================
// HOOK: useAdminBroadcast - Send broadcast notification
// ============================================================================

export function useAdminBroadcast() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendBroadcast = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminNotificationsApi.sendBroadcast(data);
      return result;
    } catch (err) {
      setError(err.message || "Không thể gửi thông báo");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendBroadcast, isLoading, error };
}

// ============================================================================
// HOOK: useAdminNotificationHistory - Get broadcast history with caching
// ============================================================================

export function useAdminNotificationHistory(params = {}) {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache for instant tab switching
  const cacheRef = useRef({});
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchHistory = useCallback(async () => {
    // Check cache first
    if (cacheRef.current[paramsKey]) {
      setHistory(cacheRef.current[paramsKey].history);
      setPagination(cacheRef.current[paramsKey].pagination);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminNotificationsApi.getHistory(params);
      setHistory(data.history || []);
      setPagination(
        data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      );
      // Cache the result
      cacheRef.current[paramsKey] = data;
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử thông báo");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refetch = useCallback(() => {
    // Clear cache on manual refetch
    cacheRef.current = {};
    fetchHistory();
  }, [fetchHistory]);

  return { history, pagination, isLoading, error, refetch };
}
