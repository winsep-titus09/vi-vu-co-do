import { useState, useEffect, useMemo } from "react";
import { models3dApi } from "./api";

// ============================================================================
// HOOK: useModels3D - Get list of 3D models
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
