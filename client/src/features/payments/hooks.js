// client/src/features/payments/hooks.js
import { useState, useCallback } from "react";
import { paymentsApi } from "./api";

// ============================================================================
// HOOK: useCreateCheckout - Create payment checkout session
// ============================================================================

/**
 * Hook to create a payment checkout session
 * Used after booking is created and status is 'awaiting_payment'
 */
export function useCreateCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckout = useCallback(async (bookingId, method = "wallet") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await paymentsApi.createCheckout(bookingId, method);
      return { success: true, data: response };
    } catch (err) {
      const message = err.message || "Không thể tạo phiên thanh toán";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createCheckout, isLoading, error };
}
