// client/src/features/posts/hooks.js
import { useState, useEffect } from "react";
import postsApi from "./api";

/**
 * Hook to fetch list of articles with filters
 * @param {Object} params - { page, limit, q, categoryId }
 */
export const useArticles = (params = {}) => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await postsApi.listArticles(params);

        if (isMounted) {
          // Handle both direct array response and object with items property
          if (Array.isArray(response)) {
            setArticles(response);
            setPagination({
              page: 1,
              limit: response.length,
              total: response.length,
            });
          } else if (response && typeof response === "object") {
            setArticles(response.items || []);
            setPagination({
              page: response.page || 1,
              limit: response.limit || 10,
              total: response.total || 0,
            });
          } else {
            setArticles([]);
            setPagination({ page: 1, limit: 10, total: 0 });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching articles:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load articles"
          );
          setArticles([]);
          setPagination({ page: 1, limit: 10, total: 0 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { articles, isLoading, error, pagination };
};

/**
 * Hook to fetch single article by ID
 * @param {string} id - Article ID
 */
export const useArticle = (id) => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await postsApi.getArticle(id);

        if (isMounted) {
          setArticle(response);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching article:", err);
          setError(err.response?.data?.message || "Failed to load article");
          setArticle(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { article, isLoading, error };
};

/**
 * Hook to fetch article categories
 */
export const useArticleCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await postsApi.listArticleCategories();

        if (isMounted) {
          // Handle both array and object responses
          if (Array.isArray(response)) {
            setCategories(response);
          } else if (response && typeof response === "object") {
            setCategories(response.items || response.data || []);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching categories:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load categories"
          );
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading, error };
};
