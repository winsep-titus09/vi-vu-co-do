// src/features/tours/hooks.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { toursApi } from "./api";

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Đã có lỗi xảy ra";

function useReloadTrigger() {
  const [reloadToken, setReloadToken] = useState(0);
  const trigger = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);
  return [reloadToken, trigger];
}

/**
 * Hook to fetch tour categories
 */
export const useTourCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await toursApi.getCategories();

        // Handle different response formats
        let categoriesArray = [];
        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data?.categories && Array.isArray(data.categories)) {
          categoriesArray = data.categories;
        } else if (data?.value && Array.isArray(data.value)) {
          categoriesArray = data.value;
        } else if (data?.items && Array.isArray(data.items)) {
          categoriesArray = data.items;
        }

        setCategories(categoriesArray);
      } catch (err) {
        console.error("Error fetching tour categories:", err);
        setError(err.message || "Failed to fetch categories");
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

/**
 * Hook to fetch tours list
 */
export const useTours = (params = {}) => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  // Stringify params for dependency comparison
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await toursApi.listTours(params);

        // Handle both formats
        const toursArray = data?.items || (Array.isArray(data) ? data : []);
        setTours(toursArray);

        if (data?.page && data?.limit) {
          setPagination({
            page: data.page,
            limit: data.limit,
            total: data.total || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching tours:", err);
        setError(err.message || "Failed to fetch tours");
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { tours, isLoading, error, pagination };
};

/**
 * Hook to fetch single tour
 */
export const useTour = (id) => {
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchTour = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await toursApi.getTour(id);
        setTour(data);
      } catch (err) {
        console.error("Error fetching tour:", err);
        setError(err.message || "Failed to fetch tour");
        setTour(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  return { tour, isLoading, error };
};

// ============================================================================
// TOUR EDIT REQUESTS HOOKS (FOR GUIDES)
// ============================================================================

/**
 * Hook to fetch guide's own edit requests
 */
export const useMyEditRequests = (params = {}) => {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: params.limit || 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, refetch] = useReloadTrigger();
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  useEffect(
    () => {
      let ignore = false;
      async function fetchData() {
        try {
          setIsLoading(true);
          setError(null);
          const data = await toursApi.getMyEditRequests(params);
          if (!ignore) setState(data);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setState({
              items: [],
              total: 0,
              page: 1,
              pageSize: params.limit || 20,
            });
          }
        } finally {
          if (!ignore) setIsLoading(false);
        }
      }

      fetchData();
      return () => {
        ignore = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey, reloadToken]
  );

  return {
    requests: state.items,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to create tour edit request
 */
export const useCreateEditRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await toursApi.createEditRequest(data);
      return result;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
};

/**
 * Hook to cancel tour edit request
 */
export const useCancelEditRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancel = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await toursApi.cancelEditRequest(id);
      return result;
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { cancel, isLoading, error };
};
