import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import CreatePollPage from "./pages/CreatePollPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import PublicProfilePage from "./pages/PublicProfilePage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { appStyles as s } from "./assets/dummyStyles.jsx";
import { Loader2 } from "lucide-react";

// protect Routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className={s.loadingContainer}>
        <Loader2 className={s.loadingSpinner} size={32} />
      </div>
    );
  } else {
    return user ? children : <Navigate to="/login" replace />;
  }
}

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-poll" element={<CreatePollPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route
            path="/my-polls"
            element={<DashboardPage endpoint="/polls/mine" title="My polls" />}
          />
          <Route
            path="/voted-polls"
            element={
              <DashboardPage endpoint="/polls/voted" title="Polls I voted on" />
            }
          />
          <Route
            path="/bookmarked-polls"
            element={
              <DashboardPage endpoint="/polls/bookmarks" title="Saved polls" />
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
