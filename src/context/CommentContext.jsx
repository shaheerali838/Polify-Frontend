import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../utils/api";
import { ConfirmModal } from "../components/UIElements.jsx";

const CommentContext = createContext(null);

const normalizeComments = (comments) =>
  Array.isArray(comments) ? comments : [];

export function CommentProvider({ poll, user, onChanged, children }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(poll?.comments || 0);
  const [showComments, setShowComments] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    setCommentCount(poll?.comments || 0);
  }, [poll?.comments]);

  useEffect(() => {
    setComment("");
    setComments([]);
    setCommentCount(poll?.comments || 0);
    setShowComments(false);
    setShowCommentDeleteModal(false);
    setCommentToDelete(null);
    setCommentError("");
  }, [poll?._id]);

  const loadComments = useCallback(async () => {
    if (!poll?._id) return;

    try {
      const { data } = await api.get(`/comments/${poll._id}`);
      const nextComments = normalizeComments(data);
      setComments(nextComments);
      setCommentCount(nextComments.length);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Could not load comments.",
      );
    }
  }, [poll?._id]);

  const toggleComments = useCallback(async () => {
    const next = !showComments;
    setShowComments(next);
    if (next) await loadComments();
  }, [loadComments, showComments]);

  const isOwnComment = useCallback(
    (item) => {
      const currentUserId = user?._id || user?.id;
      const authorId =
        item?.user?._id ||
        item?.user?.id ||
        item?.userId ||
        item?.author?._id ||
        item?.author?.id ||
        item?.authorId;

      return Boolean(
        item?.isMine ||
        item?.mine ||
        (currentUserId &&
          authorId &&
          String(authorId) === String(currentUserId)),
      );
    },
    [user],
  );

  const addComment = useCallback(
    async (event) => {
      event.preventDefault();
      const text = comment.trim();
      if (!text) return;

      const optimisticComment = {
        _id: `local-${Date.now()}`,
        text,
        isMine: true,
        user: {
          _id: user?._id || user?.id,
          name: user?.name || "You",
        },
      };

      setComment("");
      setComments((current) => {
        const safeCurrent = normalizeComments(current);
        return [optimisticComment].concat(safeCurrent);
      });
      setCommentCount((current) => current + 1);
      onChanged?.(
        Object.assign({}, poll, { comments: (poll.comments || 0) + 1 }),
      );

      try {
        await api.post(`/comments/${poll._id}`, { text });
        await loadComments();
        const { data: refreshedPoll } = await api.get(`/polls/${poll._id}`);
        onChanged?.(refreshedPoll);
      } catch (err) {
        setComments((current) =>
          normalizeComments(current).filter(
            (item) => item._id !== optimisticComment._id,
          ),
        );
        setCommentCount((current) => Math.max(0, current - 1));
        onChanged?.(
          Object.assign({}, poll, {
            comments: Math.max(0, (poll.comments || 0) - 1),
          }),
        );
        setCommentError(
          err.response?.data?.message || "Could not post your comment.",
        );
      }
    },
    [comment, loadComments, onChanged, poll, user],
  );

  const deleteComment = useCallback(
    async (item) => {
      if (!item || deletingComment) return;

      const commentId = item._id;
      if (!commentId || String(commentId).startsWith("local-")) {
        setComments((current) =>
          normalizeComments(current).filter((entry) => entry._id !== commentId),
        );
        setCommentCount((current) => Math.max(0, current - 1));
        onChanged?.(
          Object.assign({}, poll, {
            comments: Math.max(0, (poll.comments || 0) - 1),
          }),
        );
        setShowCommentDeleteModal(false);
        setCommentToDelete(null);
        return;
      }

      setDeletingComment(true);
      setShowCommentDeleteModal(false);
      setCommentToDelete(null);
      setCommentError("");

      const previousComments = normalizeComments(comments);
      const previousCount = commentCount;

      setComments((current) =>
        normalizeComments(current).filter((entry) => entry._id !== commentId),
      );
      setCommentCount((current) => Math.max(0, current - 1));
      onChanged?.(
        Object.assign({}, poll, {
          comments: Math.max(0, (poll.comments || 0) - 1),
        }),
      );

      try {
        await api.delete(`/comments/${commentId}`);
        await loadComments();

        const { data: refreshedPoll } = await api.get(`/polls/${poll._id}`);
        onChanged?.(refreshedPoll);
      } catch (err) {
        setComments(previousComments);
        setCommentCount(previousCount);
        onChanged?.(Object.assign({}, poll, { comments: poll.comments || 0 }));
        setCommentError(
          err.response?.data?.message || "Could not delete your comment.",
        );
      } finally {
        setDeletingComment(false);
      }
    },
    [commentCount, comments, deletingComment, loadComments, onChanged, poll],
  );

  const value = useMemo(
    () => ({
      comment,
      setComment,
      comments,
      setComments,
      commentCount,
      showComments,
      setShowComments,
      showCommentDeleteModal,
      setShowCommentDeleteModal,
      commentToDelete,
      setCommentToDelete,
      deletingComment,
      commentError,
      setCommentError,
      addComment,
      deleteComment,
      toggleComments,
      isOwnComment,
      loadComments,
    }),
    [
      addComment,
      comment,
      commentCount,
      commentError,
      comments,
      commentToDelete,
      deletingComment,
      deleteComment,
      isOwnComment,
      loadComments,
      setComment,
      setCommentToDelete,
      setComments,
      setShowCommentDeleteModal,
      setShowComments,
      showCommentDeleteModal,
      showComments,
      toggleComments,
    ],
  );

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComments must be used inside a CommentProvider");
  }
  return context;
}

export function CommentSection() {
  const {
    addComment,
    comment,
    commentError,
    comments,
    commentToDelete,
    deleteComment,
    isOwnComment,
    setComment,
    setCommentToDelete,
    setShowCommentDeleteModal,
    showCommentDeleteModal,
    showComments,
  } = useComments();

  if (!showComments) return null;

  return (
    <div className="mt-4 border-t border-zinc-400 dark:border-zinc-800 pt-4">
      <form onSubmit={addComment} className="mb-3 flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add a comment"
          className="flex-1 rounded-xl border border-zinc-400 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-white transition hover:bg-emerald-400"
        >
          Post
        </button>
      </form>

      {commentError && (
        <p className="mb-3 text-xs text-rose-300">{commentError}</p>
      )}

      <div className="space-y-2">
        {normalizeComments(comments).map((item) => (
          <div
            key={item._id}
            className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 text-sm text-zinc-500 dark:text-zinc-800 dark:text-zinc-300"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1">
                <b className="text-zinc-950 dark:text-zinc-100">{item.user?.name}: </b>
                {item.text}
              </p>
              {isOwnComment(item) && (
                <button
                  type="button"
                  onClick={() => {
                    setCommentToDelete(item);
                    setShowCommentDeleteModal(true);
                  }}
                  className="shrink-0 text-xs text-rose-300 transition hover:text-rose-200"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={showCommentDeleteModal}
        title="Delete comment"
        message="This will remove your comment from this poll. Continue?"
        confirmLabel="Delete"
        onConfirm={() => deleteComment(commentToDelete)}
        onCancel={() => {
          setShowCommentDeleteModal(false);
          setCommentToDelete(null);
        }}
      />
    </div>
  );
}
