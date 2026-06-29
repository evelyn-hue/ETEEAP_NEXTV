"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Fetch_to } from "@/utilities";
import apiLink from "@/config/api_link.json";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    // Validate inputs
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }

    // Email validation
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


  return (
    <section className="min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16">
       <div className="bg-white/90 p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
          <p className="text-gray-600">Welcome back to LCCB ETEEAP</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>

          {errorMessage && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              {successMessage}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        {/* Google Sign In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage("Google sign in failed")}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-700">
          Don{"'"}t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>

      {toastOpen && (
        <div className="fixed right-6 top-6 z-50 flex w-full max-w-sm flex-col gap-3 px-4">
          <div className="rounded-2xl bg-emerald-600 p-4 shadow-xl ring-1 ring-slate-900/10 text-white">
            <div className="text-sm font-semibold">Success</div>
            <div className="mt-2 text-sm">{successMessage}</div>
          </div>
        </div>
      )}
    </section>
  );
} 
