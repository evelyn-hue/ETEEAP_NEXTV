"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import { useAuth } from "@/context/AuthContext";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { refreshAuth } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push("/auth/signin");
  }, [email, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await Fetch_to("/services/supabase/auth/verify-otp", { email, otp: code });

      if (response.success) {
        if (response.data?.token && typeof window !== "undefined") {
          localStorage.setItem("authToken", response.data.token);
        }
        await refreshAuth();
        router.push("/");
      } else {
        setError(response.message || "Invalid code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    try {
      await Fetch_to("/services/supabase/auth/send-otp", { email });
      setResendTimer(60);
    } catch {
      setError("Failed to resend code");
    }
  };

  return (
    <section className="min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 px-4">
      <div className="bg-white/90 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">
            We sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          ))}
        </div>

        {error ? (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-blue-700 font-semibold disabled:text-gray-400"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
