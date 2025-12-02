import { useState, useEffect, useMemo, useCallback } from "react";
import { models3dApi, adminModels3dApi, placesApi } from "./api";

// ============================================================================
// HOOK: useModels3D - Get list of 3D models (Public)
// ============================================================================

export function useModels3D(params = {}) {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let isMounted = true;

    async function fetchModels() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await models3dApi.listModels(params);
        if (isMounted) {
          setModels(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải danh sách mô hình 3D");
          setModels([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { models, isLoading, error };
}

// ============================================================================
// HOOK: useModel3D - Get single 3D model by ID
// ============================================================================

export function useModel3D(id) {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchModel() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await models3dApi.getModel(id);
        if (isMounted) {
          setModel(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải mô hình 3D");
          setModel(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchModel();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { model, isLoading, error };
}

// ============================================================================
// HOOK: useAdminModels3D - Admin list with pagination
// ============================================================================

export function useAdminModels3D(params = {}) {
  const [data, setData] = useState({
    models: [],
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
      const response = await adminModels3dApi.listModels(params);
      setData(response);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách mô hình 3D");
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, isLoading, error, refetch };
}

// ============================================================================
// HOOK: useAdminModel3DActions - CRUD actions for admin
// ============================================================================

export function useAdminModel3DActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createModel = useCallback(async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminModels3dApi.createModel(formData);
      return response;
    } catch (err) {
      setError(err.message || "Không thể tạo mô hình 3D");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateModel = useCallback(async (id, formData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminModels3dApi.updateModel(id, formData);
      return response;
    } catch (err) {
      setError(err.message || "Không thể cập nhật mô hình 3D");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteModel = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminModels3dApi.deleteModel(id);
      return response;
    } catch (err) {
      setError(err.message || "Không thể xóa mô hình 3D");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createModel, updateModel, deleteModel, isLoading, error };
}

// ============================================================================
// HOOK: useLocations - Get list of locations (for dropdown)
// ============================================================================

export function useLocations(params = {}) {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLocations() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await placesApi.listLocations(params);
        if (isMounted) {
          setLocations(data.locations || data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể tải danh sách địa điểm");
          setLocations([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  return { locations, isLoading, error };
}
