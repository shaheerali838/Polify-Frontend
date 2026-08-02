import React, { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "./UIElements.jsx";

export default function FollowButton({
  username,
  className = "",
  onFollowChange,
}) {
  const { user, connections, toggleFollow } = useAuth();
  const [loading, setLoading] = useState(false);

  // If the target is the current user, don't show the button
  if (user?.username === username) {
    return null;
  }

  // Determine if the current user is following the target user
  const isFollowing =
    connections?.following?.some((conn) => conn.username === username || conn === username) || false;

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await toggleFollow(username);
      onFollowChange?.(!isFollowing);
    } catch (err) {
      console.error("Failed to toggle follow state", err);
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 border border-zinc-700 bg-zinc-950 hover:border-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition ${className}`}
      >
        <UserMinus size={14} />
        {loading ? "..." : "Unfollow"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition ${className}`}
    >
      <UserPlus size={14} />
      {loading ? "..." : "Follow"}
    </Button>
  );
}
