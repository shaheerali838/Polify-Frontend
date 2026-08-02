import React, { useRef, useState } from "react";
import { layoutStyles as s } from "../assets/dummyStyles";
import {
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  LayoutGrid,
  LogOut,
  PenLine,
  Plus,
  Search,
  UserRound,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import useClickOutside from "../hooks/useClickoutside.js";
import NotificationBell from "./NotificationBell.jsx";
import { Avatar } from "./UIElements.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { to: "/create-poll", label: "Create", Icon: Plus },
  { to: "/my-profile", label: "My Profile", Icon: UserRound },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const query = searchParams.get("q") || "";
  const userRef = useRef(null);

  useClickOutside(userRef, () => setUserOpen(false), userOpen);

  const updateSearch = (value) => {
    const next = value
      ? `/dashboard?q=${encodeURIComponent(value)}`
      : "/dashboard";
    navigate(next, { replace: true });
  };

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarLinkClass = ({ isActive }) =>
    `${s.sideLinkBase} ${isActive ? s.sideLinkActive : s.sideLinkInactive}`;

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <NavLink to="/dashboard" className={s.logoLink}>
            <img src="/favicon.svg" alt="logo" className={s.logoImg} />
            <span className={s.logoSpan}>Pollify</span>
          </NavLink>

          <div className={s.searchDesktop}>
            <Search size={14} className={s.searchIcon} />
            <input
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search polls"
              className={s.searchInput}
            />
          </div>

          <div className={s.rightCluster}>
            <button
              onClick={() => setMobileSearch((value) => !value)}
              className={s.mobileSearchToggle}
            >
              {mobileSearch ? <X size={17} /> : <Search size={17} />}
            </button>
            <NavLink to="/create-poll" className={s.createButton}>
              <Plus size={15} /> Create
            </NavLink>
            <NotificationBell />

            <div ref={userRef} className={s.avatarWrapper}>
              <button onClick={() => setUserOpen((value) => !value)}>
                <Avatar user={user} className={s.avatarClass} />
              </button>
              {userOpen && (
                <div className="dropdown-scrollbar absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-zinc-500">@{user?.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserOpen(false);
                      navigate(`/profile/${user?.username}`);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <UserRound size={16} /> View profile
                  </button>
                  <button
                    onClick={() => {
                      setUserOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileSearch && (
          <div className={s.mobileSearchContainer}>
            <div className={s.mobileSearchInner}>
              <Search size={14} className={s.searchIcon} />
              <input
                value={query}
                onChange={(event) => updateSearch(event.target.value)}
                className={s.mobileSearchInput}
                placeholder="Search polls"
              />
            </div>
          </div>
        )}
      </header>

      <div className={s.bodyContainer}>
        <aside className={s.leftSidebar}>
          <p className={s.menuLabel}>Menu</p>
          <nav className={s.navContainer}>
            {NAV.map(({ to, label, Icon }) => {
              const linkTo = to === "/my-profile" ? `/profile/${user?.username}` : to;
              return (
                <NavLink key={to} to={linkTo} className={sidebarLinkClass}>
                  <Icon size={17} />
                  {label}
                </NavLink>
              );
            })}
          </nav>
          <div className={s.sidebarBottom}>
            <button onClick={signOut} className={s.logoutButton}>
              <LogOut size={17} /> Logout
            </button>
          </div>
        </aside>

        <main className={s.mainContent}>
          <Outlet />
        </main>

        <aside className={s.rightRail}>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="mb-3 flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User avatar"}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-semibold text-emerald-300">
                  {user?.name?.[0]?.toUpperCase() || <UserRound size={18} />}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  Welcome, {user?.name}
                </p>
                <p className="text-xs text-zinc-500">
                  @{user?.username || "user"}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Create polls, vote, comment, and save your favorite conversations.
            </p>
          </div>
        </aside>
      </div>

      <nav className={s.bottomNav}>
        {NAV.map(({ to, label, Icon }) => {
          const linkTo = to === "/my-profile" ? `/profile/${user?.username}` : to;
          return (
            <NavLink
              key={to}
              to={linkTo}
              className={({ isActive }) =>
                `${s.bottomLinkBase} ${
                  isActive ? s.bottomLinkActive : s.bottomLinkInactive
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
