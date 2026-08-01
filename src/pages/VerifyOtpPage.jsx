import React from "react";
import { verifyOtpStyles as s } from "../assets/dummyStyles.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import OtpStep from "../components/OtpStep.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

const VerifyOtpPage = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const email = useLocation().state?.email;

  if (!email) return <Navigate to="/signup" replace />;

  // to submit
  const submit = async (otp) => {
    await verifyOTP({ email, otp });
    navigate("/login", { state: { verified: true } });
  };

  return (
    <AuthLayout
      title="Check Your inbox"
      subtitle="We had sent a 6-digit code to verify your email address"
    >
      <OtpStep
        email={email}
        onSubmit={submit}
        onResend={() => resendOTP(email)}
        submitText="Verify Email"
      />
      <p className={s.footerText}>
        Wrong email?{" "}
        <Link to="/signup" className={s.link}>
          Go Back
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
