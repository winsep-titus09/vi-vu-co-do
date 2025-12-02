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
 * Hook to fetch single article by ID (public - only approved articles)
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
 * Hook to fetch guide's own article by ID (any status)
 * @param {string} id - Article ID
 */
export const useMyArticle = (id) => {
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
        const response = await postsApi.getMyArticle(id);

        if (isMounted) {
          setArticle(response);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching my article:", err);
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

/**
 * Hook to fetch guide's own articles
 * @param {Object} params - { page, limit, status }
 */
export const useMyArticles = (params = {}) => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const paramsKey = JSON.stringify(params);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postsApi.getMyArticles(params);

      if (response && typeof response === "object") {
        setArticles(response.items || []);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 20,
          total: response.total || 0,
        });
      } else {
        setArticles([]);
        setPagination({ page: 1, limit: 20, total: 0 });
      }
    } catch (err) {
      console.error("Error fetching my articles:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load articles"
      );
      setArticles([]);
      setPagination({ page: 1, limit: 20, total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { articles, isLoading, error, pagination, refetch: fetchArticles };
};

/**
 * Hook to delete an article
 */
export const useDeleteArticle = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteArticle = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      await postsApi.deleteArticle(id);
      return true;
    } catch (err) {
      console.error("Error deleting article:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete article"
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteArticle, isDeleting, error };
};

/**
 * Hook to update an article
 */
export const useUpdateArticle = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateArticle = async (id, data) => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await postsApi.updateArticle(id, data);
      return response;
    } catch (err) {
      console.error("Error updating article:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update article"
      );
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateArticle, isUpdating, error };
};

/**
 * Hook to create a new article
 */
export const useCreateArticle = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const createArticle = async (data) => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await postsApi.createArticle(data);
      return response;
    } catch (err) {
      console.error("Error creating article:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to create article"
      );
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createArticle, isCreating, error };
};

// ============================================================================
// ADMIN ARTICLE HOOKS
// ============================================================================

/**
 * Hook to fetch all articles for admin
 * @param {Object} params - { page, limit, status, q }
 */
export const useAdminArticles = (params = {}) => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const paramsKey = JSON.stringify(params);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postsApi.adminListArticles(params);

      if (response && typeof response === "object") {
        setArticles(response.items || []);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 20,
          total: response.total || 0,
        });
      } else {
        setArticles([]);
        setPagination({ page: 1, limit: 20, total: 0 });
      }
    } catch (err) {
      console.error("Error fetching admin articles:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load articles"
      );
      setArticles([]);
      setPagination({ page: 1, limit: 20, total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { articles, isLoading, error, pagination, refetch: fetchArticles };
};

/**
 * Hook for admin article actions (approve, reject, delete)
 */
export const useAdminArticleActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveArticle = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postsApi.adminApproveArticle(id);
      return response;
    } catch (err) {
      console.error("Error approving article:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve article"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectArticle = async (id, reason = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postsApi.adminRejectArticle(id, reason);
      return response;
    } catch (err) {
      console.error("Error rejecting article:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to reject article"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await postsApi.adminDeleteArticle(id);
      return true;
    } catch (err) {
      console.error("Error deleting article:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete article"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { approveArticle, rejectArticle, deleteArticle, isLoading, error };
};

/**
 * Hook to create article as admin (auto-approved)
 */
export const useAdminCreateArticle = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const createArticle = async (data) => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await postsApi.adminCreateArticle(data);
      return response;
    } catch (err) {
      console.error("Error creating article (admin):", err);
      setError(
        err.response?.data?.message || err.message || "Failed to create article"
      );
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createArticle, isCreating, error };
};

/**
 * Hook to update any article as admin
 */
export const useAdminUpdateArticle = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateArticle = async (id, data) => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await postsApi.adminUpdateArticle(id, data);
      return response;
    } catch (err) {
      console.error("Error updating article (admin):", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update article"
      );
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateArticle, isUpdating, error };
};
