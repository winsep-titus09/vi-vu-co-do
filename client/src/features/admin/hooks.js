import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "./api";

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Đã có lỗi xảy ra";

function useReloadTrigger() {
  const [reloadToken, setReloadToken] = useState(0);
  const trigger = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);
  return [reloadToken, trigger];
}

export function useAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, refetch] = useReloadTrigger();

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminApi.getDashboardSummary();
        if (!ignore) setSummary(data);
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
          setSummary(null);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  return { summary, isLoading, error, refetch };
}

export function useAdminRevenues(params = {}) {
  const [data, setData] = useState([]);
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
          const items = await adminApi.getTopTourRevenues(params);
          if (!ignore) setData(items || []);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setData([]);
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

  return { revenues: data, isLoading, error, refetch };
}

export function useAdminTourRequests(params = {}) {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: params.limit || 10,
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
          const response = await adminApi.getTourRequests(params);
          if (!ignore) setState(response);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setState((prev) => ({ ...prev, items: [] }));
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

  return { ...state, isLoading, error, refetch };
}

export function useAdminPayouts(params = {}) {
  const [payouts, setPayouts] = useState([]);
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
          const response = await adminApi.getPayouts(params);
          if (!ignore) setPayouts(response || []);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setPayouts([]);
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

  return { payouts, isLoading, error, refetch };
}

// ============================================================================
// REVENUE TREND (Line chart 7 ngày)
// ============================================================================
export function useRevenueTrend(params = {}) {
  const [data, setData] = useState([]);
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
          const result = await adminApi.getRevenueTrend(params);
          if (!ignore) setData(result || []);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setData([]);
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

  return { data, isLoading, error, refetch };
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================
export function useApproveTourRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const approve = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.approveTourRequest(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approve, isLoading, error };
}

export function useRejectTourRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reject = useCallback(async (id, reason = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.rejectTourRequest(id, reason);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reject, isLoading, error };
}

export function useProcessPayout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const process = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.processPayout(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { process, isLoading, error };
}

// ============================================================================
// ADMIN TOURS HOOKS
// ============================================================================

export function useAdminTours(params = {}) {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: params.limit || 20,
    counts: { all: 0, pending: 0, active: 0, hidden: 0 },
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
          const data = await adminApi.getTours(params);
          if (!ignore) setState(data);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setState({
              items: [],
              total: 0,
              page: 1,
              pageSize: params.limit || 20,
              counts: { all: 0, pending: 0, active: 0, hidden: 0 },
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
    tours: state.items,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    counts: state.counts,
    isLoading,
    error,
    refetch,
  };
}

export function useApproveTour() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const approve = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.approveTour(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approve, isLoading, error };
}

export function useRejectTour() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reject = useCallback(async (id, notes = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.rejectTour(id, notes);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reject, isLoading, error };
}

export function useToggleTourVisibility() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.toggleTourVisibility(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { toggle, isLoading, error };
}

export function useDeleteTour() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTour = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.deleteTour(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteTour, isLoading, error };
}

// ============================================================================
// ADMIN TOUR EDIT REQUESTS HOOKS
// ============================================================================

export function useAdminTourEditRequests(params = {}) {
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
          const data = await adminApi.getTourEditRequests(params);
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
}

export function useApproveTourEditRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const approve = useCallback(async (id, data = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.approveTourEditRequest(id, data);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approve, isLoading, error };
}

export function useRejectTourEditRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reject = useCallback(async (id, notes = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.rejectTourEditRequest(id, notes);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reject, isLoading, error };
}

// ============================================================================
// ADMIN LOCATIONS (PLACES) HOOKS
// ============================================================================

export function useAdminLocations(params = {}) {
  const [locations, setLocations] = useState([]);
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
          const data = await adminApi.getLocations(params);
          if (!ignore) setLocations(data);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setLocations([]);
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

  return { locations, isLoading, error, refetch };
}

export function useLocationCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminApi.getLocationCategories();
        if (!ignore) setCategories(data);
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
          setCategories([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  return { categories, isLoading, error };
}

export function useCreateLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.createLocation(formData);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}

export function useUpdateLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, formData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.updateLocation(id, formData);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
}

export function useDeleteLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.deleteLocation(id);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { remove, isLoading, error };
}

// ============================================================================
// FINANCE HOOKS
// ============================================================================

export function useFinanceStats(params = {}) {
  const [stats, setStats] = useState(null);
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
          const data = await adminApi.getFinanceStats(params);
          if (!ignore) setStats(data);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setStats(null);
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

  return { stats, isLoading, error, refetch };
}

export function useFinanceTransactions(params = {}) {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: params.limit || 20,
    totalPages: 1,
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
          const response = await adminApi.getFinanceTransactions(params);
          if (!ignore) setState(response);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setState((prev) => ({ ...prev, items: [] }));
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

  return { ...state, isLoading, error, refetch };
}

export function useFinancePayouts(params = {}) {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: params.limit || 20,
    totalPages: 1,
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
          const response = await adminApi.getFinancePayouts(params);
          if (!ignore) setState(response);
        } catch (err) {
          if (!ignore) {
            setError(getErrorMessage(err));
            setState((prev) => ({ ...prev, items: [] }));
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

  return { ...state, isLoading, error, refetch };
}

export function useConfirmPayout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const confirm = useCallback(async (id, data = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.confirmPayout(id, data);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { confirm, isLoading, error };
}

// ============================================================================
// PAYMENT SETTINGS HOOKS
// ============================================================================

export function usePaymentSettings() {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, refetch] = useReloadTrigger();

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminApi.getPaymentSettings();
        if (!ignore) setSettings(data);
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
          setSettings([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  return { settings, isLoading, error, refetch };
}

export function useUpdatePaymentSetting() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (gateway, data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.updatePaymentSetting(gateway, data);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
}
