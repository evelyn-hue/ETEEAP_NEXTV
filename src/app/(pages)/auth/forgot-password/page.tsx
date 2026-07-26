"use client";

import { useState } from "react";
import Fetch_to from "@/utilities/Fetch_to";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/shared/PageTransition";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

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
    <PageTransition>
    <section className="min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 px-4">
      <div className="bg-white/90 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h1>
          <p className="text-gray-600 text-sm">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-green-700 mb-4">{message}</p>
            <Link href="/auth/signin" className="text-blue-700 font-semibold hover:underline">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {error ? <p className="text-red-600 text-sm">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700">
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
    </PageTransition>
  );
}
