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
 * Fetch single article by slug or ID (public - only approved articles)
 * @param {string} idOrSlug - Article slug or Mongo ID
 * @returns {Promise<Object>} Article with populated author
 */
export const getArticle = async (idOrSlug) => {
  const data = await apiClient.get(`/articles/${idOrSlug}`);
  return data;
};

/**
 * Fetch related articles (same category or author)
 * @param {string} idOrSlug - Current article slug or ID
 * @param {number} limit - Max number of related articles (default: 4)
 * @returns {Promise<{ items: Array }>} Related articles
 */
export const getRelatedArticles = async (idOrSlug, limit = 4) => {
  const data = await apiClient.get(`/articles/${idOrSlug}/related`, {
    params: { limit },
  });
  return data;
};

/**
 * Fetch single article by ID for guide (own article, any status)
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Article with populated category
 */
export const getMyArticle = async (id) => {
  const data = await apiClient.get(`/articles/mine/${id}`);
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

/**
 * Fetch guide's own articles
 * @param {Object} params - { page, limit, status }
 * @returns {Promise<{ items: Array, page: number, limit: number, total: number }>}
 */
export const getMyArticles = async (params = {}) => {
  const data = await apiClient.get("/articles/mine", { params });
  return data;
};

/**
 * Delete an article
 * @param {string} id - Article ID
 */
export const deleteArticle = async (id) => {
  const data = await apiClient.delete(`/articles/${id}`);
  return data;
};

/**
 * Update an article
 * @param {string} id - Article ID
 * @param {Object} data - Article data to update
 */
export const updateArticle = async (id, articleData) => {
  const data = await apiClient.put(`/articles/${id}`, articleData);
  return data;
};

/**
 * Create a new article
 * @param {Object} articleData - { title, content_html, cover_image, categoryId, status }
 * @returns {Promise<Object>} Created article
 */
export const createArticle = async (articleData) => {
  const data = await apiClient.post("/articles", articleData);
  return data;
};

// ============================================================================
// ADMIN ARTICLE API
// ============================================================================

/**
 * Admin: Fetch all articles with filter
 * @param {Object} params - { page, limit, status (pending/approved/rejected), q }
 * @returns {Promise<{ items: Array, total: number, page: number, limit: number }>}
 */
export const adminListArticles = async (params = {}) => {
  const data = await apiClient.get("/articles/admin", { params });
  return data;
};

/**
 * Admin: Approve an article
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Updated article
 */
export const adminApproveArticle = async (id) => {
  const data = await apiClient.patch(`/articles/admin/${id}/approve`);
  return data;
};

/**
 * Admin: Reject an article
 * @param {string} id - Article ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated article
 */
export const adminRejectArticle = async (id, reason = "") => {
  const data = await apiClient.patch(`/articles/admin/${id}/reject`, {
    reason,
  });
  return data;
};

/**
 * Admin: Delete an article
 * @param {string} id - Article ID
 */
export const adminDeleteArticle = async (id) => {
  const data = await apiClient.delete(`/articles/${id}`);
  return data;
};

/**
 * Admin: Create a new article/notification (auto-approved)
 * @param {Object} articleData - { title, content_html, type, audience }
 * @returns {Promise<Object>} Created article
 */
export const adminCreateArticle = async (articleData) => {
  const data = await apiClient.post("/articles/admin", articleData);
  return data;
};

/**
 * Admin: Update any article
 * @param {string} id - Article ID
 * @param {Object} articleData - Article data to update
 * @returns {Promise<Object>} Updated article
 */
export const adminUpdateArticle = async (id, articleData) => {
  const data = await apiClient.put(`/articles/admin/${id}`, articleData);
  return data;
};

// ============================================================================
// ARTICLE COMMENTS API
// ============================================================================

/**
 * Fetch comments for an article (public)
 * @param {string} articleId - Article ID
 * @param {Object} params - { page, limit }
 * @returns {Promise<{ items: Array, page: number, limit: number, total: number }>}
 */
export const getArticleComments = async (articleId, params = {}) => {
  const data = await apiClient.get(`/articles/${articleId}/comments`, { params });
  return data;
};

/**
 * Fetch more replies for a comment
 * @param {string} articleId - Article ID
 * @param {string} commentId - Comment ID
 * @param {Object} params - { page, limit }
 * @returns {Promise<{ items: Array, page: number, limit: number, total: number }>}
 */
export const getCommentReplies = async (articleId, commentId, params = {}) => {
  const data = await apiClient.get(`/articles/${articleId}/comments/${commentId}/replies`, { params });
  return data;
};

/**
 * Create a comment on an article (authenticated)
 * @param {string} articleId - Article ID
 * @param {Object} commentData - { content, parentId? }
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (articleId, commentData) => {
  const data = await apiClient.post(`/articles/${articleId}/comments`, commentData);
  return data;
};

/**
 * Update own comment
 * @param {string} articleId - Article ID
 * @param {string} commentId - Comment ID
 * @param {Object} commentData - { content }
 * @returns {Promise<Object>} Updated comment
 */
export const updateComment = async (articleId, commentId, commentData) => {
  const data = await apiClient.put(`/articles/${articleId}/comments/${commentId}`, commentData);
  return data;
};

/**
 * Delete a comment (own comment or admin)
 * @param {string} articleId - Article ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteComment = async (articleId, commentId) => {
  const data = await apiClient.delete(`/articles/${articleId}/comments/${commentId}`);
  return data;
};

const postsApi = {
  listArticles,
  getArticle,
  getRelatedArticles,
  getMyArticle,
  listArticleCategories,
  getArticleCategoryBySlug,
  getMyArticles,
  deleteArticle,
  updateArticle,
  createArticle,
  // Admin
  adminListArticles,
  adminApproveArticle,
  adminRejectArticle,
  adminDeleteArticle,
  adminCreateArticle,
  adminUpdateArticle,
  // Comments
  getArticleComments,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
};

export default postsApi;
