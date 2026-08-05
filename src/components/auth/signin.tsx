"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Fetch_to } from "@/utilities";
import apiLink from "@/config/api_link.json";
import imgSrc from "@/config/img_src.json";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const reduced = useReducedMotion();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await Fetch_to("/services/supabase/auth/google-auth", {
        credential: credentialResponse.credential,
      });
      if (response.success && typeof window !== "undefined" && response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        await refreshAuth();
        router.push("/");
      } else {
        setErrorMessage(response.message || "Google sign in failed");
      }
    } catch {
      setErrorMessage("Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    const response = await Fetch_to(apiLink.auth.signin, {
      password: formData.password,
      email: formData.email,
    });
    if (response.success) {
      const authResponse = await Fetch_to(apiLink.jwt.auth, { email: formData.email }) as {
        success: boolean;
        data?: { token?: string };
        message?: string;
      };
      if (authResponse.success && typeof window !== "undefined" && authResponse.data?.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("authToken", authResponse.data.token);
      }
      await refreshAuth();
      const nextPath = formData.email === "admin@admin.com" ? "/admin" : "/";
      setSuccessMessage("Sign in successful!");
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        router.push(nextPath);
      }, 1400);
    } else {
      setErrorMessage(response.message || "Sign in failed. Please try again.");
    }
    setLoading(false);
  };

  const fadeUp = reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4 overflow-hidden p-2">
                <Image src={imgSrc.eteeapLogo} alt="ETEEAP" width={40} height={40} className="object-contain" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                Welcome Back
              </h1>
              <p className="text-muted mt-1.5 text-sm">
                Continue your journey with LCCB ETEEAP
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
                  />
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/40"
                  />
                  <span className="text-muted">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition">
                  Forgot password?
                </Link>
              </motion.div>

              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.p
                    key="error"
                    initial={reduced ? {} : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                    role="alert"
                  >
                    {errorMessage}
                  </motion.p>
                )}
                {successMessage && (
                  <motion.div
                    key="success"
                    initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                    role="status"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-surface-warm text-muted">Or continue with</span>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage("Google sign in failed")}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </motion.div>

            <motion.p {...fadeUp} transition={{ delay: 0.45 }} className="text-center text-sm text-muted mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                Sign Up
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {toastOpen && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? {} : { opacity: 0, x: 40 }}
            className="fixed right-6 top-6 z-50 w-full max-w-sm px-4"
          >
            <div className="rounded-xl bg-success p-4 shadow-xl text-white">
              <p className="text-sm font-semibold">Welcome back!</p>
              <p className="mt-1 text-sm text-white/90">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
} 
