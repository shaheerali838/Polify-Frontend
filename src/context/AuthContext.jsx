import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ created: 0, voted: 0, bookmarked: 0 });
  const [loading, setLoading] = useState(true);

  //   to load users profile
  const loadMe = async () => {
    try {
      const { data } = await api.get(`/auth/me`);
      setUser(data.user);
      setStats(data.stats);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const { data } = await api.get(`/auth/me`);
      setStats(data.stats);
    } catch (error) {
      console.error("Could not refresh profile stats", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) loadMe();
    else setLoading(false);
  }, []);

  // to save the the token in the localstorage
  const saveToken = async (token) => {
    localStorage.setItem("token", token);
    await loadMe();
  };

  //   to register a new user
  const register = async (formData) =>
    (await api.post(`/auth/register`, formData)).data;

  //   to verify OTP
  const verifyOTP = async (payload) =>
    await api.post(`/auth/verify-otp`, payload);

  //   to resend OTP
  const resendOTP = async (email) => {
    try {
      const response = await api.post(`/auth/resend-otp`, { email });
      return response.data; // Explicitly return the success data
    } catch (error) {
      console.error(
        "Resend error:",
        error.response?.data?.message || error.message,
      );
      throw error; // Pass the error down to your component's catch block
    }
  };
  //   to login a user
  const login = async (payload) => {
    const { data } = await api.post(`/auth/login`, payload);
    await saveToken(data.Token);
  };

  // for forget password
  const forgetPassword = (email) =>
    api.post(`/auth/forget-password`, { email });

  const verifyResetOtp = (payload) =>
    api.post(`/auth/verify-reset-otp`, payload);

  const resetPassword = (payload) => api.post(`/auth/reset-password`, payload);

  // for setting page to update profile and change password
  const updateProfile = async (formData) => {
    const { data } = await api.patch(`/auth/profile`, formData);
    setUser(data.user);
  };

  const changePassword = (payload) =>
    api.patch(`/auth/password`, payload);

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // to delete account
  const deleteAccount = async () => {
    await api.delete(`/auth/delete-account`);
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        register,
        verifyOTP,
        resendOTP,
        login,
        forgetPassword,
        verifyResetOtp,
        resetPassword,
        updateProfile,
        changePassword,
        deleteAccount,
        logout,
        refresh: loadMe,
        refreshStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
