import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "./UIElements.jsx";

export default function UserBadge({ user, className = "", rightAction, subtitleSuffix }) {
  const safeUser = user || {};
  const username = safeUser.username || "user";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link to={`/profile/${username}`} className="shrink-0 hover:opacity-80 transition-opacity">
        <Avatar user={safeUser} className="h-10 w-10" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${username}`} className="truncate text-sm font-semibold text-white hover:underline">
            {safeUser.name || "Pollify user"}
          </Link>
          {rightAction}
        </div>
        <p className="text-xs text-zinc-500">
          <Link to={`/profile/${username}`} className="hover:underline">
            @{username}
          </Link>
          {subtitleSuffix}
        </p>
      </div>
    </div>
  );
}
