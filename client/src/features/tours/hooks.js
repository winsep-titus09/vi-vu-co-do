// src/features/tours/hooks.js
import { useState, useEffect } from "react";
import { toursApi } from "./api";

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
