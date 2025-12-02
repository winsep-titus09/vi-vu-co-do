// src/features/categories/hooks.js
import { useState, useEffect, useCallback } from "react";
import { categoriesApi } from "./api";

// ============================================================================
// Hook to fetch all categories
// ============================================================================
export function useCategories(params = {}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesApi.list(params);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Không thể tải danh mục");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}

// ============================================================================
// Hook for category CRUD operations
// ============================================================================
export function useCategoryActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCategory = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await categoriesApi.create(data);
      return { success: true, data: result };
    } catch (err) {
      console.error("Create category error:", err);
      const message = err.message || "Không thể tạo danh mục";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await categoriesApi.update(id, data);
      return { success: true, data: result };
    } catch (err) {
      console.error("Update category error:", err);
      const message = err.message || "Không thể cập nhật danh mục";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id, force = false) => {
    try {
      setIsLoading(true);
      setError(null);
      await categoriesApi.delete(id, force);
      return { success: true };
    } catch (err) {
      console.error("Delete category error:", err);
      const message = err.message || "Không thể xóa danh mục";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error,
  };
}
