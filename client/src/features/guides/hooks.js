// src/features/guides/hooks.js
import { useState, useEffect } from "react";
import guidesApi from "./api";
import apiClient from "../../lib/api-client";

/**
 * Hook to fetch featured guides
 */
export const useFeaturedGuides = (limit = 4) => {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await guidesApi.getFeaturedGuides(limit);

        // Handle response format
        const guidesArray = data?.items || (Array.isArray(data) ? data : []);
        setGuides(guidesArray);
      } catch (err) {
        console.error("Error fetching featured guides:", err);
        setError(err.message || "Failed to fetch guides");
        setGuides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, [limit]);

  return { guides, isLoading, error };
};

/**
 * Hook to fetch top rated guides
 */
export const useTopRatedGuides = (limit = 5) => {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await guidesApi.getTopRatedGuides(limit);

        const guidesArray = data?.items || (Array.isArray(data) ? data : []);
        setGuides(guidesArray);
      } catch (err) {
        console.error("Error fetching top rated guides:", err);
        setError(err.message || "Failed to fetch guides");
        setGuides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, [limit]);

  return { guides, isLoading, error };
};

/**
 * Hook to fetch single guide profile
 */
export const useGuideProfile = (guideId) => {
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }

    const fetchGuide = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await guidesApi.getGuideProfile(guideId);
        setGuide(data);
      } catch (err) {
        console.error("Error fetching guide profile:", err);
        setError(err.message || "Failed to fetch guide");
        setGuide(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  return { guide, isLoading, error };
};

/**
 * Hook to fetch guide's tours
 */
export const useGuideTours = (guideId, options = {}) => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId) {
      setTours([]);
      setIsLoading(false);
      return;
    }

    const fetchTours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getGuideTours(guideId, options);
        const items = response?.items || response?.data?.items || [];
        setTours(items);
      } catch (err) {
        console.error("Error fetching guide tours:", err);
        setError(err.message || "Failed to fetch tours");
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [guideId, JSON.stringify(options)]);

  return { tours, isLoading, error };
};

/**
 * Hook to fetch guide's busy dates
 */
export const useGuideBusyDates = (guideId, startDate, endDate) => {
  const [busyDates, setBusyDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId) {
      setBusyDates([]);
      setIsLoading(false);
      return;
    }

    const fetchBusyDates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await guidesApi.getGuideBusyDates(guideId, params);
        const dates =
          response?.items || response?.data?.items || response?.data || [];
        setBusyDates(dates);
      } catch (err) {
        console.error("Error fetching busy dates:", err);
        setError(err.message || "Failed to fetch busy dates");
        setBusyDates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusyDates();
  }, [guideId, startDate, endDate]);

  return { busyDates, isLoading, error };
};

/**
 * Hook to fetch guide's reviews
 */
export const useGuideReviews = (guideId, options = {}) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId) {
      setReviews([]);
      setStats(null);
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch reviews and stats in parallel
        const [reviewsResponse, statsResponse] = await Promise.all([
          guidesApi.getGuideReviews(guideId, options),
          guidesApi.getGuideReviewStats(guideId),
        ]);

        const reviewItems =
          reviewsResponse?.items || reviewsResponse?.data?.items || [];
        setReviews(reviewItems);
        setStats(statsResponse?.data || statsResponse);
      } catch (err) {
        console.error("Error fetching guide reviews:", err);
        setError(err.message || "Failed to fetch reviews");
        setReviews([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [guideId, JSON.stringify(options)]);

  return { reviews, stats, isLoading, error };
};

// ========== GUIDE DASHBOARD HOOKS ==========

/**
 * Hook to get guide dashboard stats
 */
export function useGuideDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getDashboard();
        setData(response);
      } catch (err) {
        console.error("Fetch guide dashboard error:", err);
        setError(err.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to get guide bookings with filters
 */
export function useGuideBookings(params = {}) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [groups, setGroups] = useState(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getBookings(params);

      if (response.grouped && response.groups) {
        setGroups(response.groups);
        // Flatten all groups for bookings array
        const allBookings = [
          ...(response.groups.received || []),
          ...(response.groups.completed || []),
          ...(response.groups.canceled || []),
          ...(response.groups.others || []),
        ];
        setBookings(allBookings);
      } else {
        setBookings(response.bookings || []);
      }

      setTotal(response.total || 0);
    } catch (err) {
      console.error("Fetch guide bookings error:", err);
      setError(err.message || "Không thể tải danh sách booking");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [JSON.stringify(params)]);

  return { bookings, groups, total, isLoading, error, refetch: fetchBookings };
}

/**
 * Hook to get pending booking requests
 */
export function useBookingRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get bookings with status waiting_guide
      const response = await guidesApi.getBookings({
        status: "waiting_guide",
        limit: 20,
      });

      setRequests(response.bookings || []);
    } catch (err) {
      console.error("Fetch booking requests error:", err);
      setError(err.message || "Không thể tải yêu cầu đặt tour");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, isLoading, error, refetch: fetchRequests };
}

/**
 * Hook to get upcoming confirmed bookings
 */
export function useUpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcoming = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get accepted/paid bookings
      const response = await guidesApi.getBookings({
        status: "accepted,paid",
        limit: 10,
      });

      const allBookings = response.bookings || [];

      // Filter future bookings and sort by date
      const upcoming = allBookings
        .filter((b) => new Date(b.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      setBookings(upcoming);
    } catch (err) {
      console.error("Fetch upcoming bookings error:", err);
      setError(err.message || "Không thể tải lịch trình sắp tới");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  return { bookings, isLoading, error, refetch: fetchUpcoming };
}

/**
 * Hook to get monthly earnings
 */
export function useMonthlyEarnings(year) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getMonthlyEarnings(year);
        setData(response);
      } catch (err) {
        console.error("Fetch monthly earnings error:", err);
        setError(err.message || "Không thể tải thu nhập");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [year]);

  return { data, isLoading, error };
}

/**
 * Hook to get weekly performance stats
 */
export function useWeeklyStats() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getWeeklyStats();
        setData(response);
      } catch (err) {
        console.error("Fetch weekly stats error:", err);
        setError(err.message || "Không thể tải thống kê tuần");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to get single booking by ID
 */
export function useBookingById(bookingId) {
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getBookingById(bookingId);
      setBooking(response);
    } catch (err) {
      console.error("Fetch booking error:", err);
      setError(err.message || "Không thể tải thông tin booking");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  return { booking, isLoading, error, refetch: fetchBooking };
}

/**
 * Hook to get guide's own tours
 */
export function useMyTours(params = {}) {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getMyTours(params);

      // Handle response format
      const toursArray =
        response?.items ||
        response?.tours ||
        (Array.isArray(response) ? response : []);
      setTours(toursArray);
      setTotal(response?.total || toursArray.length);
    } catch (err) {
      console.error("Fetch my tours error:", err);
      setError(err.message || "Không thể tải danh sách tour");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [JSON.stringify(params)]);

  return { tours, total, isLoading, error, refetch: fetchTours };
}

/**
 * Hook to get tour categories
 */
export function useTourCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getTourCategories();
        const items =
          response?.items || (Array.isArray(response) ? response : []);
        setCategories(items);
      } catch (err) {
        console.error("Fetch tour categories error:", err);
        setError(err.message || "Không thể tải danh mục");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}

/**
 * Hook to get locations for tour creation
 */
export function useLocations(params = {}) {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await guidesApi.getLocations({
          limit: 100,
          ...params,
        });
        const items =
          response?.items || (Array.isArray(response) ? response : []);
        setLocations(items);
      } catch (err) {
        console.error("Fetch locations error:", err);
        setError(err.message || "Không thể tải địa điểm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [JSON.stringify(params)]);

  return { locations, isLoading, error };
}

/**
 * Hook to create tour directly (guide creates tour with pending approval)
 */
export function useCreateTour() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createTour = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.createTour(data);
      return response;
    } catch (err) {
      console.error("Create tour error:", err);
      setError(err.message || "Không thể tạo tour");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createTour, isSubmitting, error };
}

/**
 * Hook to create tour request - DEPRECATED, use useCreateTour
 */
export function useCreateTourRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createTourRequest = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.createTourRequest(data);
      return response;
    } catch (err) {
      console.error("Create tour request error:", err);
      setError(err.message || "Không thể tạo yêu cầu tour");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createTourRequest, isSubmitting, error };
}

/**
 * Hook to get a single tour or tour request by ID
 */
export function useTourDetail(id) {
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTour = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      // Try to get from tour-requests first (for pending/rejected)
      try {
        const response = await guidesApi.getTourRequest(id);
        setTour({ ...response, type: "request" });
        return;
      } catch {
        // If not found in tour-requests, try regular tours API
      }
      // Fallback to regular tour
      const response = await apiClient.get(`/tours/${id}`);
      setTour({ ...response, type: "tour" });
    } catch (err) {
      console.error("Fetch tour detail error:", err);
      setError(err.message || "Không thể tải thông tin tour");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTour();
  }, [id]);

  return { tour, isLoading, error, refetch: fetchTour };
}

/**
 * Hook to update tour request
 */
export function useUpdateTourRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateTourRequest = async (id, data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.updateTourRequest(id, data);
      return response;
    } catch (err) {
      console.error("Update tour request error:", err);
      setError(err.message || "Không thể cập nhật yêu cầu tour");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateTourRequest, isSubmitting, error };
}

/**
 * Hook to delete tour request
 */
export function useDeleteTourRequest() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteTourRequest = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await guidesApi.deleteTourRequest(id);
      return response;
    } catch (err) {
      console.error("Delete tour request error:", err);
      setError(err.message || "Không thể xóa yêu cầu tour");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTourRequest, isDeleting, error };
}

/**
 * Hook to get guide calendar data
 */
export function useGuideCalendar(year, month) {
  const [calendarData, setCalendarData] = useState({});
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getGuideCalendar(year, month);
      setCalendarData(response?.calendar || {});
      setTours(response?.tours || []);
    } catch (err) {
      console.error("Fetch guide calendar error:", err);
      setError(err.message || "Không thể tải lịch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  return { calendarData, tours, isLoading, error, refetch: fetchCalendar };
}

/**
 * Hook to manage busy dates
 */
export function useBusyDates() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addBusyDates = async (dates, reason) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.addBusyDates(dates, reason);
      return response;
    } catch (err) {
      console.error("Add busy dates error:", err);
      setError(err.message || "Không thể thêm ngày bận");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeBusyDates = async (dates) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.removeBusyDates(dates);
      return response;
    } catch (err) {
      console.error("Remove busy dates error:", err);
      setError(err.message || "Không thể xóa ngày bận");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addBusyDates, removeBusyDates, isSubmitting, error };
}

/**
 * Hook to fetch my reviews (as a guide) - for guide dashboard
 */
export function useMyGuideReviews(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { page = 1, limit = 10, rating = "all" } = params;

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getMyReviews({ page, limit, rating });
      setData(response);
    } catch (err) {
      console.error("Fetch guide reviews error:", err);
      setError(err.message || "Không thể tải đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, limit, rating]);

  return { data, isLoading, error, refetch: fetchReviews };
}

/**
 * Hook to reply to a review
 */
export function useReplyToReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const replyToReview = async (reviewId, reply) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.replyToReview(reviewId, reply);
      return response;
    } catch (err) {
      console.error("Reply to review error:", err);
      setError(err.message || "Không thể gửi phản hồi");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { replyToReview, isSubmitting, error };
}

/**
 * Hook to fetch current guide's profile
 */
export function useMyGuideProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getMyProfile();
      setProfile(response);
    } catch (err) {
      console.error("Fetch my profile error:", err);
      setError(err.message || "Không thể tải hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, isLoading, error, refetch: fetchProfile };
}

/**
 * Hook to update guide profile
 */
export function useUpdateGuideProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (data) => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await guidesApi.updateMyProfile(data);
      return response;
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Không thể cập nhật hồ sơ");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfile, isUpdating, error };
}

// ========== GUIDE APPLICATION HOOKS (for tourists) ==========

/**
 * Hook to get current user's guide application status
 */
export function useMyGuideApplication() {
  const [application, setApplication] = useState(null);
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await guidesApi.getMyApplication();
      setExists(response.exists || false);
      setStatus(response.status || null);
      setApplication(response.application || null);
    } catch (err) {
      console.error("Fetch guide application error:", err);
      setError(err.message || "Không thể tải thông tin hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  return {
    application,
    exists,
    status,
    isLoading,
    error,
    refetch: fetchApplication,
  };
}

/**
 * Hook to apply to become a guide
 */
export function useApplyToBeGuide() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const apply = async (applicationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await guidesApi.applyToBeGuide(applicationData);
      return { success: true, data: response };
    } catch (err) {
      console.error("Apply to be guide error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể gửi hồ sơ";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { apply, isSubmitting, error };
}
