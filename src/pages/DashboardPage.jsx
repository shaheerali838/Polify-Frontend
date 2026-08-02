import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  Check,
  Lock,
  MessageCircle,
  Star,
  Trash2,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import {
  CommentProvider,
  CommentSection,
  useComments,
} from "../context/CommentContext.jsx";
import {
  Avatar,
  Button,
  ConfirmModal,
  Field,
  PollSkeleton,
  SelectField,
} from "../components/UIElements.jsx";
import FollowButton from "../components/FollowButton.jsx";
import UserBadge from "../components/UserBadge.jsx";

const CATEGORIES = [
  "",
  "General",
  "Technology",
  "Sports",
  "Entertainment",
  "Education",
  "Business",
  "Health",
];

const TYPES = [
  { value: "all", label: "All" },
  { value: "single", label: "Multiple choice" },
  { value: "yesno", label: "Yes / No" },
  { value: "rating", label: "Rating" },
  { value: "open", label: "Open answer" },
  { value: "image", label: "Image poll" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({
  value: category,
  label: category || "All categories",
}));

const normalizeResults = (results) => (Array.isArray(results) ? results : []);

const normalizeComments = (comments) =>
  Array.isArray(comments) ? comments : [];

const normalizeOptions = (options) => (Array.isArray(options) ? options : []);

const normalizePollList = (polls) => (Array.isArray(polls) ? polls : []);

const findResult = (poll, value) =>
  normalizeResults(poll.results).find(
    (result) =>
      String(result.index ?? result.star ?? result.text) === String(value),
  );

const buildUpdatedPollAfterVote = (poll, previousValue, nextValue) => {
  const normalizedPrevious =
    previousValue === undefined ||
    previousValue === null ||
    previousValue === ""
      ? null
      : String(previousValue);
  const normalizedNext =
    nextValue === undefined || nextValue === null || nextValue === ""
      ? null
      : String(nextValue);

  if (normalizedPrevious === normalizedNext) {
    return Object.assign({}, poll, { myVote: normalizedNext });
  }

  const nextPoll = Object.assign({}, poll, { myVote: normalizedNext });
  const totalVotes = Math.max(0, Number(poll.totalVotes || 0));
  const nextTotalVotes =
    normalizedPrevious === null ? totalVotes + 1 : totalVotes;

  if (poll.type === "open") {
    const results = normalizeResults(poll.results).map((result) =>
      result && typeof result === "object" ? Object.assign({}, result) : result,
    );
    if (normalizedPrevious === null && normalizedNext !== null) {
      results.push({ text: String(nextValue) });
    }
    return { ...nextPoll, totalVotes: nextTotalVotes, results };
  }

  const results = normalizeResults(poll.results).map((result) =>
    result && typeof result === "object" ? Object.assign({}, result) : result,
  );
  const applyDelta = (targetValue, delta) => {
    const targetResult = results.find(
      (result) =>
        String(result.index ?? result.star ?? result.text) ===
        String(targetValue),
    );

    if (targetResult) {
      targetResult.count = Math.max(0, (targetResult.count || 0) + delta);
    }
  };

  if (normalizedPrevious !== null) applyDelta(normalizedPrevious, -1);
  if (normalizedNext !== null) applyDelta(normalizedNext, 1);

  return Object.assign({}, nextPoll, {
    totalVotes: nextTotalVotes,
    results: results.map((result) =>
      Object.assign({}, result, {
        percent:
          nextTotalVotes > 0
            ? Math.round(((result.count || 0) / nextTotalVotes) * 100)
            : 0,
      }),
    ),
  });
};

export function PollCard({ poll, onChanged, onDeleted, canManage = false }) {
  const [value, setValue] = useState(poll.myVote ?? "");
  const [busy, setBusy] = useState(false);
  const [managing, setManaging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isBookmarked = Boolean(poll.isBookmarked);

  const vote = async (nextValue) => {
    const previousValue = value;
    const optimisticPoll = buildUpdatedPollAfterVote(
      poll,
      previousValue,
      nextValue,
    );

    setBusy(true);
    setError("");
    setValue(nextValue);
    onChanged?.(optimisticPoll);

    try {
      await api.post(`/polls/${poll._id}/vote`, { value: nextValue });
      const { data: refreshedPoll } = await api.get(`/polls/${poll._id}`);
      onChanged?.(refreshedPoll);
    } catch (err) {
      setValue(previousValue);
      onChanged?.(poll);
      setError(err.response?.data?.message || "Could not save your vote.");
    } finally {
      setBusy(false);
    }
  };

  const bookmark = async () => {
    setError("");

    try {
      const { data } = await api.post(`/polls/${poll._id}/bookmark`);
      onChanged?.(Object.assign({}, poll, { isBookmarked: data.bookmarked }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update bookmark.");
    }
  };

  const togglePollStatus = async () => {
    if (managing) return;

    setError("");
    setManaging(true);

    try {
      const { data } = await api.post(`/polls/${poll._id}/close`);
      onChanged?.(Object.assign({}, poll, { closed: data.closed }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this poll.");
    } finally {
      setManaging(false);
    }
  };

  const deletePoll = async () => {
    if (managing) return;

    setError("");
    setManaging(true);
    setShowDeleteModal(false);

    try {
      await api.delete(`/polls/${poll._id}`);
      onDeleted?.(poll._id);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this poll.");
    } finally {
      setManaging(false);
    }
  };

  useEffect(() => {
    setValue(poll.myVote ?? "");
  }, [poll.myVote]);

  const renderOptionButton = (label, optionValue, imageUrl) => {
    const result = findResult(poll, optionValue);
    const selected = String(value) === String(optionValue);

    return (
      <button
        key={optionValue}
        type="button"
        disabled={busy || poll.closed}
        onClick={() => vote(optionValue)}
        className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${
          selected
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-zinc-400 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:border-zinc-500 dark:hover:border-zinc-700"
        }`}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={label || "poll option"}
            className="mb-2 h-36 w-full rounded-xl object-cover"
          />
        )}
        <div className="relative z-10 flex items-center justify-between gap-3 text-sm text-zinc-950 dark:text-zinc-100">
          <span>{label}</span>
          {selected && <Check size={16} className="text-emerald-400" />}
        </div>
        {poll.totalVotes > 0 && (
          <div className="relative z-10 mt-2 text-xs text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
            {result?.percent || 0}% · {result?.count || 0} votes
          </div>
        )}
        <div
          className="absolute inset-y-0 left-0 bg-emerald-500/10"
          style={{ width: `${result?.percent || 0}%` }}
        />
      </button>
    );
  };

  const PollCardContent = () => {
    const { commentCount, showComments, toggleComments } = useComments();

    return (
      <article className="rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4 shadow-xl shadow-zinc-300/50 dark:shadow-black/20">
        <div className="mb-4 flex items-center gap-3">
          <UserBadge 
            user={poll.creator} 
            className="flex-1 min-w-0"
            rightAction={
              poll.creator?.username && (
                <FollowButton username={poll.creator.username} />
              )
            }
            subtitleSuffix={` · ${poll.category || "General"}`}
          />
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={togglePollStatus}
                  disabled={managing}
                  className="rounded-xl border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-2 text-xs text-zinc-500 dark:text-zinc-800 dark:text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  <span className="flex items-center gap-1">
                    <Lock size={14} />
                    {poll.closed ? "Re-open" : "Close"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={managing}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-300 transition hover:border-rose-400"
                >
                  <span className="flex items-center gap-1">
                    <Trash2 size={14} />
                    Delete
                  </span>
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Toggle bookmark"
              onClick={bookmark}
              className={`rounded-xl p-2 ${
                isBookmarked
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-zinc-500 dark:text-zinc-700 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold leading-snug text-zinc-950 dark:text-white">
          {poll.question}
        </h2>

        <div className="grid gap-2">
          {poll.type === "yesno" &&
            ["Yes", "No"].map((label, index) =>
              renderOptionButton(label, index),
            )}
          {poll.type === "single" &&
            normalizeOptions(poll.options).map((option, index) =>
              renderOptionButton(option.text, index),
            )}
          {poll.type === "image" &&
            normalizeOptions(poll.options).map((option, index) =>
              renderOptionButton(
                option.text || `Option ${index + 1}`,
                index,
                option.image,
              ),
            )}
          {poll.type === "rating" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  disabled={busy || poll.closed}
                  onClick={() => vote(rating)}
                  className={`flex flex-1 items-center justify-center rounded-xl border py-3 ${
                    Number(value) === rating
                      ? "border-amber-400 bg-amber-500/10 text-amber-300"
                      : "border-zinc-400 dark:border-zinc-800 text-zinc-500 dark:text-zinc-700 dark:text-zinc-500 hover:text-amber-300"
                  }`}
                >
                  <Star size={18} fill="currentColor" />
                </button>
              ))}
            </div>
          )}
          {poll.type === "open" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                vote(value);
              }}
              className="flex gap-2"
            >
              <Field
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Type your answer"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!String(value).trim() || busy || poll.closed}
              >
                Submit
              </Button>
            </form>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={14} />
            {poll.totalVotes || 0} votes
          </span>
          <button
            type="button"
            onClick={() => toggleComments()}
            className="inline-flex items-center gap-1 hover:text-zinc-500 dark:hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            <MessageCircle size={14} />
            {commentCount} comments
          </button>
          <span className="inline-flex items-center gap-1">
            <BarChart3 size={14} />
            {poll.views || 0} views
          </span>
        </div>

        <ConfirmModal
          open={showDeleteModal}
          title="Delete poll"
          message="This will permanently remove the poll and its comments. Continue?"
          confirmLabel="Delete"
          onConfirm={deletePoll}
          onCancel={() => setShowDeleteModal(false)}
        />

        {showComments && <CommentSection />}
      </article>
    );
  };

  return (
    <CommentProvider poll={poll} user={user} onChanged={onChanged}>
      <PollCardContent />
    </CommentProvider>
  );
}

export default function DashboardPage({
  endpoint = "/polls",
  title = "Discover polls",
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("");
  const query = searchParams.get("q") || "";

  const filtered = useMemo(
    () =>
      polls.filter((poll) =>
        poll.question.toLowerCase().includes(query.toLowerCase()),
      ),
    [polls, query],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = endpoint === "/polls" ? { type, category } : {};
      const { data } = await api.get(endpoint, { params });
      setPolls(normalizePollList(data));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load polls.");
    } finally {
      setLoading(false);
    }
  }, [endpoint, type, category]);

  const handlePollChange = useCallback((updatedPoll) => {
    setPolls((currentPolls) =>
      currentPolls.map((poll) =>
        poll._id === updatedPoll._id ? updatedPoll : poll,
      ),
    );
  }, []);

  const handlePollDelete = useCallback((pollId) => {
    setPolls((currentPolls) =>
      currentPolls.filter((poll) => poll._id !== pollId),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load, location.key]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <TrendingUp size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Pollify Feed
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">{title}</h1>
        {endpoint === "/polls" && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SelectField
              ariaLabel="Filter polls by type"
              value={type}
              onChange={setType}
              options={TYPES}
            />
            <SelectField
              ariaLabel="Filter polls by category"
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <PollSkeleton />
      ) : filtered.length ? (
        filtered.map((poll) => (
          <PollCard
            key={poll._id}
            poll={poll}
            onChanged={handlePollChange}
            onDeleted={handlePollDelete}
            canManage={endpoint === "/polls/mine"}
          />
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-400 dark:border-zinc-800 p-10 text-center text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
          No polls found yet.
        </div>
      )}
    </div>
  );
}
