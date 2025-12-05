// client/src/features/booking/hooks.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { bookingsApi } from "./api";

// ============================================================================
// HOOK: useCreateBooking - Create a new booking
// ============================================================================

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookingsApi.createBooking(data);
      return { success: true, data: response };
    } catch (err) {
      const message = err.message || "Không thể tạo đặt chỗ";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createBooking, isLoading, error };
}

// ============================================================================
// HOOK: useMyBookings - Get user's bookings
// ============================================================================

export function useMyBookings(params = {}) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let isMounted = true;

    async function fetchBookings() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bookingsApi.getMyBookings(params);
        if (isMounted) {
          setBookings(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải danh sách đặt chỗ");
          setBookings([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { bookings, isLoading, error };
}

// ============================================================================
// HOOK: useBookingActions - Actions for bookings (cancel, etc.)
// ============================================================================

export function useBookingActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const cancelBooking = async (id, reason) => {
    try {
      setIsProcessing(true);
      setError(null);
      const result = await bookingsApi.cancelBooking(id, reason);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || "Không thể hủy booking");
      return { success: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  };

  return { cancelBooking, isProcessing, error };
}

// ============================================================================
// HOOK: useBooking - Get single booking by ID
// ============================================================================

export function useBooking(id) {
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchBooking() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bookingsApi.getBooking(id);
        if (isMounted) {
          setBooking(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải thông tin đặt chỗ");
          setBooking(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBooking();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { booking, isLoading, error };
}
