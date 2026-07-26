"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { refreshAuth } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (!email) router.push("/auth/signin"); }, [email, router]);
  useEffect(() => {
    if (resendTimer > 0) { const t = setInterval(() => setResendTimer((p) => p - 1), 1000); return () => clearInterval(t); }
  }, [resendTimer]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };
  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the complete 6-digit code"); return; }
    setLoading(true); setError("");
    try {
      const response = await Fetch_to("/services/supabase/auth/verify-otp", { email, otp: code });
      if (response.success) {
        if (response.data?.token && typeof window !== "undefined") localStorage.setItem("authToken", response.data.token);
        await refreshAuth();
        router.push("/");
      } else setError(response.message || "Invalid code");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };
  const handleResend = async () => {
    if (resendTimer > 0) return; setError("");
    try { await Fetch_to("/services/supabase/auth/send-otp", { email }); setResendTimer(60); }
    catch { setError("Failed to resend"); }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Verify Your Email</h1>
              <p className="text-muted text-sm">We sent a 6-digit code to <span className="font-semibold">{email}</span></p>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((d, i) => (
                <input key={i} ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
                  value={d} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
              ))}
            </div>
            {error ? <p className="text-red-600 text-sm text-center mb-4">{error}</p> : null}
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
              {loading ? "Verifying..." : "Verify"}
            </button>
            <p className="text-center text-sm text-muted mt-4">
              Didn&apos;t receive the code?{" "}
              <button type="button" onClick={handleResend} disabled={resendTimer > 0}
                className="text-blue-600 font-semibold disabled:text-gray-400">
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
