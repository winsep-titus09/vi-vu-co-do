import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../../features/auth/hooks";
import {
  useArticleComments,
  useCreateComment,
  useDeleteComment,
  useCommentReplies,
} from "../../features/posts/hooks";
import Loader from "../Loaders/Loader";

/**
 * Comment Section Component for Articles
 * Supports top-level comments and one level of replies
 */
const CommentSection = ({ articleId }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    comments,
    setComments,
    isLoading,
    error,
    pagination,
    // refetch - available for future use
  } = useArticleComments(articleId);
  const { createComment, isCreating } = useCreateComment();
  const { deleteComment, isDeleting } = useDeleteComment();
  const { loadReplies, isLoading: loadingReplies } = useCommentReplies();

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);

  // Handle submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCreating) return;

    const result = await createComment(articleId, { content: newComment.trim() });
    if (result?.data) {
      // Add new comment to the top of the list
      setComments((prev) => [
        {
          ...result.data,
          replies: [],
          totalReplies: 0,
          hasMoreReplies: false,
        },
        ...prev,
      ]);
      setNewComment("");
    }
  };

  // Handle submit reply
  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim() || isCreating) return;

    const result = await createComment(articleId, {
      content: replyContent.trim(),
      parentId,
    });

    if (result?.data) {
      // Add reply to the comment's replies array
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), result.data],
              totalReplies: (comment.totalReplies || 0) + 1,
            };
          }
          return comment;
        })
      );
      setReplyingTo(null);
      setReplyContent("");
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId, parentId = null) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    const success = await deleteComment(articleId, commentId);
    if (success) {
      if (parentId) {
        // Delete reply
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === parentId) {
              return {
                ...comment,
                replies: comment.replies.filter((r) => r._id !== commentId),
                totalReplies: comment.totalReplies - 1,
              };
            }
            return comment;
          })
        );
      } else {
        // Delete top-level comment
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    }
  };

  // Load more replies
  const handleLoadMoreReplies = async (commentId) => {
    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    const currentPage = Math.ceil((comment.replies?.length || 0) / 10) + 1;
    const result = await loadReplies(articleId, commentId, { page: currentPage });

    if (result?.items) {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            const existingIds = new Set(c.replies.map((r) => r._id));
            const newReplies = result.items.filter((r) => !existingIds.has(r._id));
            return {
              ...c,
              replies: [...c.replies, ...newReplies],
              hasMoreReplies: c.replies.length + newReplies.length < c.totalReplies,
            };
          }
          return c;
        })
      );
    }
  };

  // Load more comments
  const handleLoadMoreComments = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Would need to call API with next page - for now just refetch
    // This is a simplified version - full implementation would append results
  };

  // Format time
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  // Get user avatar or initials
  const getAvatar = (userData) => {
    if (userData?.avatar_url) {
      return (
        <img
          src={userData.avatar_url}
          alt={userData.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    const initial = userData?.name?.charAt(0)?.toUpperCase() || "?";
    return (
      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-medium">
        {initial}
      </div>
    );
  };

  // Single comment component
  const CommentItem = ({ comment, isReply = false, parentId = null }) => {
    const isOwner = user?._id === comment.userId?._id;
    const canDelete = isOwner || user?.role === "admin";

    return (
      <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
        <div className="flex-shrink-0">{getAvatar(comment.userId)}</div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">
                {comment.userId?.name || "Người dùng"}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2 ml-2">
            {/* Reply button (only for top-level comments) */}
            {!isReply && isAuthenticated && (
              <button
                onClick={() => setReplyingTo(comment._id)}
                className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
              >
                Trả lời
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={() => handleDeleteComment(comment._id, parentId)}
                disabled={isDeleting}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment._id && (
            <form
              onSubmit={(e) => handleSubmitReply(e, comment._id)}
              className="mt-3 ml-12"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isCreating}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isCreating ? "Đang gửi..." : "Trả lời"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="px-4 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {!isReply && comment.replies?.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  isReply
                  parentId={comment._id}
                />
              ))}

              {/* Load more replies */}
              {comment.hasMoreReplies && (
                <button
                  onClick={() => handleLoadMoreReplies(comment._id)}
                  disabled={loadingReplies}
                  className="ml-12 text-sm text-amber-600 hover:text-amber-700"
                >
                  {loadingReplies
                    ? "Đang tải..."
                    : `Xem thêm phản hồi (${comment.totalReplies - comment.replies.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Bình luận ({pagination.total})
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">{getAvatar(user)}</div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isCreating}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? "Đang gửi..." : "Đăng bình luận"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Vui lòng{" "}
            <a href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              đăng nhập
            </a>{" "}
            để bình luận.
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}

          {/* Load more comments */}
          {pagination.page < pagination.totalPages && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMoreComments}
                className="px-6 py-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                Xem thêm bình luận
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
