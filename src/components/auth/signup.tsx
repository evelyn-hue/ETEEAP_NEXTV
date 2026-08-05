"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import Image from "next/image";
import { Fetch_to } from "@/utilities";
import apiLink from "@/config/api_link.json";
import imgSrc from "@/config/img_src.json";
import { useAuth } from "@/context/AuthContext";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  civilStatus: string;
  password: string;
  c_password: string;
};

type InputProps = {
  icon: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function Input({ icon, placeholder, value, onChange, error }: InputProps) {
  return (
    <div className="relative mb-4">
      <span className="absolute top-3 left-3 text-gray-400">{icon}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SignUp() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    civilStatus: "Single",
    password: "",
    c_password: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const reduced = useReducedMotion();
  const fadeUp = reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const validationErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) {
      validationErrors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      validationErrors.lastName = "Last name is required";
    }

    if (form.password !== form.c_password) {
      validationErrors.password = "Password not match";
    }

    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.email = "Enter a valid email address";
    }

    if (!/^\d{11}$/.test(form.phone)) {
      validationErrors.phone = "Phone must be 11 digits";
    }

    if (!form.password) {
      validationErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      validationErrors.password = "Password must include at least one uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      validationErrors.password = "Password must include at least one lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      validationErrors.password = "Password must include at least one number";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await submitForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;

    try {
      const response = await Fetch_to("/services/supabase/auth/google-auth", {
        credential: credentialResponse.credential,
      });

      if (response.success && typeof window !== "undefined" && response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        await refreshAuth();
        router.push("/");
      } else {
        alert("Google sign in failed");
      }
    } catch {
      alert("Google sign in failed");
    }
  };

  const submitForm = async () => {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const response = await Fetch_to(apiLink.auth.signup, {
      fullName: fullName,
      password: form.password,
      civil_status: form.civilStatus,
      phone: form.phone,
      email: form.email,
    });

    if (response.success) {
      if (response.data?.require_otp) {
        const signupEmail = response.data?.email || form.email;
        router.push(`/auth/verify-otp?email=${encodeURIComponent(signupEmail)}`);
        return;
      }

      // Fallback: direct JWT (OTP columns not yet migrated)
      if (response.data?.token && typeof window !== "undefined") {
        localStorage.setItem("authToken", response.data.token);
      }
      await refreshAuth();
      router.push("/");
    } else {
      alert(`Error: ${response.message}`);
    }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-lg mx-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4 overflow-hidden p-2">
                <Image src={imgSrc.eteeapLogo} alt="ETEEAP" width={40} height={40} className="object-contain" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                Create Account
              </h1>
              <p className="text-muted mt-1.5 text-sm">
                Join the LCCB ETEEAP community
              </p>
            </motion.div>
            <form onSubmit={handleSubmit}>

        {/* First Name */}
        <Input
          icon={<FaUser />}
          placeholder="First Name"
          value={form.firstName}
          onChange={(v) => handleChange("firstName", v)}
          error={errors.firstName}
        />

        {/* Last Name */}
        <Input
          icon={<FaUser />}
          placeholder="Last Name"
          value={form.lastName}
          onChange={(v) => handleChange("lastName", v)}
          error={errors.lastName}
        />

        {/* Email */}
        <Input
          icon={<FaEnvelope />}
          placeholder="Email"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
          error={errors.email}
        />

        {/* Phone */}
        <Input
          icon={<FaUser />}
          placeholder="Phone (11 digits)"
          value={form.phone}
          onChange={(v) =>
            handleChange("phone", v.replace(/\D/g, "").slice(0, 11))
          }
          error={errors.phone}
        />

        {/* Civil Status */}
        <select
          value={form.civilStatus}
          onChange={(e) => handleChange("civilStatus", e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        >
          <option>Single</option>
          <option>Married</option>
          <option>Widowed</option>
          <option>Divorced</option>
        </select>

        {/* Password */}
        <div className="relative mb-4">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-3"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.c_password}
            onChange={(e) => handleChange("c_password", e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-3"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password}</p>
          )}
        </div>

        {/* Agreement */}
        <div className="mb-4 text-sm text-gray-700">

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />

            <span>
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setModalType("terms")}
                className="text-blue-600 hover:underline"
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setModalType("privacy")}
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </button>
            </span>
          </div>

        </div>

        {/* Submit */}
              <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                <button
                  type="submit"
                  disabled={!agreed || submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? "Creating Account..." : "Sign Up"}
                </button>
              </motion.div>

        {/* Divider */}
        <div className="relative my-4">
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
            onError={() => alert("Google sign in failed")}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
          />
        </div>

              <motion.p {...fadeUp} transition={{ delay: 0.35 }} className="text-center text-sm text-muted mt-6">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  Sign In
                </Link>
              </motion.p>

      </form>
      {modalType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              {modalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </h3>
            <div className="text-sm text-gray-700 max-h-80 overflow-y-auto space-y-3">
              {modalType === "terms" ? (
                <>
                  <p className="font-semibold">1. Acceptance of Terms</p>
                  <p>
                    By accessing and using the LCCB ETEEAP Online Application and Alumni System, you agree to comply with these Terms and Conditions. If you do not agree, you must not use the system.
                  </p>

                  <p className="font-semibold">2. Purpose of the System</p>
                  <p>
                    This system is designed for the submission, processing, evaluation, and management of ETEEAP applications and alumni records of LCCB.
                  </p>

                  <p className="font-semibold">3. Eligibility</p>
                  <p>
                    Users must be legitimate applicants or alumni of LCCB. Providing false identity or unauthorized access is strictly prohibited.
                  </p>

                  <p className="font-semibold">4. User Responsibilities</p>
                  <p>
                    Users are responsible for ensuring that all information, documents, images, and files submitted are accurate, complete, and valid. You are also responsible for maintaining the confidentiality of your account.
                  </p>

                  <p className="font-semibold">5. Prohibited Actions</p>
                  <p>
                    Users must not:
                    - Submit false or misleading information  
                    - Upload inappropriate or unauthorized content  
                    - Attempt to hack, disrupt, or misuse the system  
                    - Create multiple accounts or impersonate others  
                  </p>

                  <p className="font-semibold">6. Account Management</p>
                  <p>
                    The LCCB ETEEAP Coordinator reserves the right to suspend or terminate accounts that violate these terms without prior notice.
                  </p>

                  <p className="font-semibold">7. Data Accuracy</p>
                  <p>
                    All submitted data including documents, images, and personal details are subject to verification by LCCB administrators.
                  </p>

                  <p className="font-semibold">8. System Modifications</p>
                  <p>
                    LCCB reserves the right to modify or update the system and its policies at any time.
                  </p>

                  <p className="font-semibold">9. Limitation of Liability</p>
                  <p>
                    The institution is not liable for any issues arising from incorrect information provided by users or unauthorized access due to user negligence.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">1. Introduction</p>
                  <p>
                    The LCCB ETEEAP Online Application and Alumni System is committed to protecting your personal data in compliance with the Data Privacy Act of 2012 (RA 10173).
                  </p>

                  <p className="font-semibold">2. Information We Collect</p>
                  <p>
                    We collect the following personal data:
                    - Full name  
                    - Email address (including Google login email)  
                    - Phone number  
                    - Civil status  
                    - Uploaded documents (files, credentials, requirements)  
                    - Profile images or identification photos  
                  </p>

                  <p className="font-semibold">3. How We Collect Data</p>
                  <p>
                    Data is collected during registration, application submission, document uploads, and through Google OAuth authentication.
                  </p>

                  <p className="font-semibold">4. Purpose of Data Collection</p>
                  <p>
                    Your information is used for:
                    - Processing ETEEAP applications  
                    - Alumni record management  
                    - Identity verification  
                    - Communication with applicants  
                    - System authentication via Google login  
                  </p>

                  <p className="font-semibold">5. Data Storage and Protection</p>
                  <p>
                    All personal data is securely stored and accessible only to authorized LCCB ETEEAP coordinators and system administrators.
                  </p>

                  <p className="font-semibold">6. Data Sharing</p>
                  <p>
                    Your data is NOT sold or shared with third parties. Information may only be accessed by authorized LCCB personnel for academic and administrative purposes.
                  </p>

                  <p className="font-semibold">7. Google Authentication</p>
                  <p>
                    If you sign in using Google, we only receive basic account information such as your name and email address for authentication purposes.
                  </p>

                  <p className="font-semibold">8. Data Retention</p>
                  <p>
                    Your data will be retained as long as necessary for academic, administrative, and alumni record purposes unless deletion is requested or required by law.
                  </p>

                  <p className="font-semibold">9. Your Rights</p>
                  <p>
                    You have the right to:
                    - Access your personal data  
                    - Request correction of inaccurate data  
                    - Request deletion of your account (subject to institutional policies)  
                  </p>

                  <p className="font-semibold">10. Security Measures</p>
                  <p>
                    We implement security measures to protect against unauthorized access, alteration, or disclosure of your data.
                  </p>

                  <p className="font-semibold">11. Policy Updates</p>
                  <p>
                    This Privacy Policy may be updated periodically. Continued use of the system means you accept any changes.
                  </p>

                  <p className="font-semibold">12. Contact Information</p>
                  <p>
                    For concerns regarding your data privacy, please contact the LCCB ETEEAP Coordinator or system administrator.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}