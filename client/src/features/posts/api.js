// client/src/features/posts/api.js
import apiClient from "../../lib/api-client";

/**
 * Fetch list of published articles (public)
 * @param {Object} params - { page, limit, q (search), categoryId }
 * @returns {Promise<{ items: Array, page: number, limit: number, total: number }>}
 */
export const listArticles = async (params = {}) => {
  const data = await apiClient.get("/articles", { params });
  return data;
};

/**
 * Fetch single article by ID (public)
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Article with populated author
 */
export const getArticle = async (id) => {
  const data = await apiClient.get(`/articles/${id}`);
  return data;
};

/**
 * Fetch all article categories (public)
 * @returns {Promise<Array>} List of categories
 */
export const listArticleCategories = async () => {
  const data = await apiClient.get("/article-categories");
  return data.data || data;
};

/**
 * Fetch category by slug (public)
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category object
 */
export const getArticleCategoryBySlug = async (slug) => {
  const data = await apiClient.get(`/article-categories/slug/${slug}`);
  return data;
};

const postsApi = {
  listArticles,
  getArticle,
  listArticleCategories,
  getArticleCategoryBySlug,
};

export default postsApi;
