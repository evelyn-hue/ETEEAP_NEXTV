"use client";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import Fetch_to from "@/utilities/Fetch_to";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await Fetch_to("/services/supabase/auth/forgot-password", { email: email.trim() });
      setSent(true);
      setMessage(response.message || "If the email exists, a reset link has been sent.");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Forgot Password</h1>
              <p className="text-muted text-sm">Enter your email to receive a reset link</p>
            </div>
            {sent ? (
              <div className="text-center">
                <p className="text-green-700 mb-4">{message}</p>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">Return to Sign In</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
                </div>
                {error ? <p className="text-red-600 text-sm">{error}</p> : null}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="text-center">
                  <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-blue-600">
                    <ArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
