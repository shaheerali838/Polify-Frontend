import { useEffect, useMemo, useState } from "react";
import { Camera, Lock, Shield, Trash2, UserRound, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, ConfirmModal } from "../components/UIElements.jsx";

const initialForm = (user = {}) => ({
  name: user?.name || "",
  username: user?.username || "",
  bio: user?.bio || "",
});

const SettingsPage = () => {
  const {
    user,
    stats,
    updateProfile,
    changePassword,
    deleteAccount,
    refresh,
    refreshStats,
    connections,
  } = useAuth();
  const [form, setForm] = useState(initialForm(user));
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setForm(initialForm(user));
    setAvatarPreview(user?.avatar || "");
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("username", form.username);
      payload.append("bio", form.bio);
      if (avatarFile) payload.append("image", avatarFile);

      await updateProfile(payload);
      await refresh();
      setAvatarFile(null);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Could not update your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Could not update your password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await deleteAccount();
      setMessage({ type: "success", text: "Account deleted." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Could not delete your account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="mb-5 flex items-center gap-2">
          <Settings size={22} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>
        <p className="text-sm text-zinc-400">Manage your profile details, avatar, and security settings.</p>
      </div>

      {message.text ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/20"
        >
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Edit profile</h2>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name || "Profile avatar"}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-2xl font-semibold text-emerald-300">
                  {user?.name?.[0]?.toUpperCase() || <UserRound size={24} />}
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-emerald-300 shadow-lg">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Profile Photo</p>
              <p className="text-xs text-zinc-500 mt-1">Recommended 400x400px.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">
                Full name
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleProfileChange}
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                placeholder="Your full name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Username</span>
              <input
                name="username"
                value={form.username}
                onChange={handleProfileChange}
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                placeholder="username"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleProfileChange}
                rows="4"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                placeholder="Tell people about yourself"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(initialForm(user));
                setAvatarPreview(user?.avatar || "");
                setAvatarFile(null);
              }}
            >
              Reset
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/20"
          >
            <div className="mb-5 flex items-center gap-2">
              <Lock size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                Change password
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">
                  Current password
                </span>
                <input
                  type="password"
                  value={passwords.oldPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      oldPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                  placeholder="Enter current password"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">
                  New password
                </span>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">
                  Confirm new password
                </span>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-400"
                  placeholder="Re-enter password"
                />
              </label>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>

          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center gap-2">
              <Shield size={18} className="text-rose-300" />
              <h2 className="text-lg font-semibold text-white">
                Account actions
              </h2>
            </div>
            <p className="mb-4 text-sm text-zinc-400">
              Deleting your account is permanent and removes your polls, votes,
              and comments.
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />{" "}
              {loading ? "Processing..." : "Delete account"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete account"
        message="This will permanently delete your account, polls, votes, and comments. Continue?"
        confirmLabel="Delete account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default SettingsPage;
