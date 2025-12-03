// client/src/features/payments/api.js
import apiClient from "../../lib/api-client";

// ============================================================================
// PAYMENTS API FUNCTIONS
// ============================================================================

export const paymentsApi = {
  // Tạo phiên thanh toán (MoMo/VNPay)
  // Chỉ hoạt động khi booking status = 'awaiting_payment'
  createCheckout: async (bookingId, method = "wallet") => {
    const response = await apiClient.post("/payments/checkout", {
      booking_id: bookingId,
      method, // "wallet" | "atm" | "credit"
    });
    return response;
  },
};

export default paymentsApi;
