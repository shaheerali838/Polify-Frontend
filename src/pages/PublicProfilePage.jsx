import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { UserRound, UserPlus, UserMinus, X } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, PollSkeleton, Avatar } from "../components/UIElements.jsx";
import { PollCard } from "./DashboardPage.jsx";
import { connectionsStyles } from "../assets/dummyStyles.jsx";
import UserBadge from "../components/UserBadge.jsx";

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser, connections } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [connectionsModal, setConnectionsModal] = useState(null); // 'followers' | 'following' | null

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.get(`/users/${username}`);
      setProfileData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load user profile.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handlePollChange = useCallback((updatedPoll) => {
    setProfileData((current) => {
      if (!current) return current;
      return {
        ...current,
        polls: current.polls.map((p) =>
          p._id === updatedPoll._id ? updatedPoll : p
        ),
      };
    });
  }, []);

  const handlePollDelete = useCallback((pollId) => {
    setProfileData((current) => {
      if (!current) return current;
      return {
        ...current,
        polls: current.polls.filter((p) => p._id !== pollId),
      };
    });
  }, []);

  const handleToggleFollow = async () => {
    if (!profileData) return;

    // Save previous state for rollback
    const previousIsFollowing = profileData.isFollowing;
    const previousFollowers = profileData.stats.followers;

    // Optimistically update UI
    setProfileData((current) => ({
      ...current,
      isFollowing: !previousIsFollowing,
      stats: {
        ...current.stats,
        followers: previousIsFollowing
          ? current.stats.followers - 1
          : current.stats.followers + 1,
      },
    }));

    try {
      await api.post(`/users/${username}/follow`);
    } catch (err) {
      // Revert on error
      setProfileData((current) => ({
        ...current,
        isFollowing: previousIsFollowing,
        stats: {
          ...current.stats,
          followers: previousFollowers,
        },
      }));
      setMessage({ type: "error", text: "Failed to update follow status. Please try again." });
      
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-6 animate-pulse">
          <div className="h-20 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
          <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <PollSkeleton count={2} />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
        <p>{error || "User not found."}</p>
        <Link to="/dashboard" className="text-zinc-950 dark:text-white underline mt-4 inline-block">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  const { user, isFollowing, followsMe, isMe, stats, polls } = profileData;

  const statsCards = [
    { id: "followers", label: "Followers", value: stats?.followers ?? 0 },
    { id: "following", label: "Following", value: stats?.following ?? 0 },
    { id: "created", label: "Polls created", value: stats?.created ?? 0 },
    { id: "voted", label: "Polls voted", value: stats?.voted ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-6 shadow-2xl shadow-zinc-300/50 dark:shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar user={user} className="h-20 w-20 ring-2 ring-emerald-500/30 text-3xl" />
            
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">
                  {user.name || "Pollify user"}
                </h1>
                {followsMe && !isMe && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-800 dark:text-zinc-300 border border-zinc-500 dark:border-zinc-700">
                    Follows you
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-800 dark:text-zinc-400">@{user.username}</p>
              <p className="mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-800 dark:text-zinc-300">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end">
            {isMe ? (
              <Link to="/settings">
                <Button variant="ghost" className="border border-zinc-500 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-sm">
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? "ghost" : "primary"}
                onClick={handleToggleFollow}
                className={`flex items-center gap-2 text-sm ${
                  isFollowing
                    ? "border border-zinc-500 dark:border-zinc-700 hover:border-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={16} /> Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsCards.map((item) => {
            const isClickable = isMe && (item.id === "followers" || item.id === "following");
            return (
              <div
                key={item.label}
                onClick={() => isClickable && setConnectionsModal(item.id)}
                className={`rounded-2xl border border-zinc-400 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 text-center transition-colors ${
                  isClickable ? "cursor-pointer hover:bg-white dark:hover:bg-zinc-900" : ""
                }`}
              >
                <p className="text-2xl font-semibold text-zinc-950 dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {connectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-300/50 dark:shadow-black/40 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-zinc-400 dark:border-zinc-800 p-4">
              <div className={connectionsStyles.tabContainer}>
                <button
                  onClick={() => setConnectionsModal("followers")}
                  className={`${connectionsStyles.tabButtonBase} ${
                    connectionsModal === "followers"
                      ? connectionsStyles.tabButtonActive
                      : connectionsStyles.tabButtonInactive
                  }`}
                >
                  Followers
                </button>
                <button
                  onClick={() => setConnectionsModal("following")}
                  className={`${connectionsStyles.tabButtonBase} ${
                    connectionsModal === "following"
                      ? connectionsStyles.tabButtonActive
                      : connectionsStyles.tabButtonInactive
                  }`}
                >
                  Following
                </button>
              </div>
              <button
                onClick={() => setConnectionsModal(null)}
                className="rounded-full p-2 text-zinc-500 dark:text-zinc-700 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-500 dark:hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 dropdown-scrollbar">
              {connections[connectionsModal]?.length > 0 ? (
                <div className={connectionsStyles.userList}>
                  {connections[connectionsModal].map((connUser) => (
                    <div key={connUser._id} onClick={() => setConnectionsModal(null)}>
                      <UserBadge 
                        user={connUser} 
                        className="rounded-xl px-2 py-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors w-full" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={connectionsStyles.emptyText}>
                  No {connectionsModal} yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {message.text && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 flex items-center justify-center transition-all">
          {message.text}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-4 px-2">Polls by @{user.username}</h2>
        {polls && polls.length > 0 ? (
          <div className="space-y-4">
            {polls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onChanged={handlePollChange}
                onDeleted={handlePollDelete}
                canManage={isMe}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-400 dark:border-zinc-800 p-10 text-center text-zinc-500 dark:text-zinc-700 dark:text-zinc-500">
            This user hasn't created any polls yet.
          </div>
        )}
      </div>
    </div>
  );
}
