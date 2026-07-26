"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import { useAuth } from "@/context/AuthContext";
import imgSrc from "@/config/img_src.json";
import Reveal from "@/components/shared/Reveal";

type MyprofileProps = {
  modal?: boolean;
  onClose?: () => void;
};

function ProfileBody() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const { email, fullName: authFullName, phone: authPhone, civil_status: authCivilStatus, profilePicture: authProfilePicture, loading: authLoading, refreshAuth, logout } = useAuth();
  const [preview, setPreview] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState(authFullName || "");
  const [phone, setPhone] = useState(authPhone || "");
  const [civilStatus, setCivilStatus] = useState(authCivilStatus || "");

  useEffect(() => {
    if (!authLoading && !preview) {
      if (authProfilePicture) {
        setPreview(authProfilePicture);
      }
    }
  }, [authProfilePicture, authLoading, preview]);

  useEffect(() => {
    if (!authLoading) {
      setFullName(authFullName || "");
    }
  }, [authFullName, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      setPhone(authPhone || "");
    }
  }, [authPhone, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      setCivilStatus(authCivilStatus || "");
    }
  }, [authCivilStatus, authLoading]);

  const handleProfilePictureChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !email) return;

    const temporaryUrl = URL.createObjectURL(file);
    setPreview(temporaryUrl);
    setIsUploadingPicture(true);
    setErrorMessage("");

    try {
      const result = await Fetch_toFile(
        "/services/supabase/auth/upload-profile-picture",
        { file, fields: { email } }
      );

      if (result.success) {
        const newPictureUrl = result.data.profilePictureUrl;
        setPreview(newPictureUrl);
        setSuccessMessage("Profile picture updated successfully!");
        await refreshAuth();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to upload profile picture");
        setPreview(authProfilePicture || imgSrc.heroImage);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Failed to upload profile picture");
      setPreview(authProfilePicture || imgSrc.heroImage);
    } finally {
      setIsUploadingPicture(false);
      URL.revokeObjectURL(temporaryUrl);
    }
  };

  const handleSaveProfile = async () => {
    if (!email) {
      setErrorMessage("Email not found. Please log in again.");
      return;
    }

    if (!/^[0-9]{11}$/.test(phone)) {
      setPhoneError("Phone number must be exactly 11 digits.");
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const result = await Fetch_to("/services/supabase/auth/update-profile", {
        email,
        fullName,
        phone,
        civil_status: civilStatus,
      });

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        await refreshAuth();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setErrorMessage("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/auth/signin");
    } catch (err) {
      console.error("Sign out error:", err);
      setErrorMessage("Failed to sign out");
    }
  };

  const handleCancelSignOut = () => {
    setShowSignOutConfirm(false);
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Reveal>
    <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 ring-1 ring-green-200">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <motion.section whileHover={reduced ? undefined : { scale: 1.03 }} className="shrink-0">
          <div className="h-36 w-36 overflow-hidden rounded-3xl border-4 border-white bg-slate-200 shadow-lg">
            {preview ? (
              <Image
                key={`modal-profile-${preview}`}
                src={preview}
                alt="Profile picture"
                width={300}
                height={300}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-slate-200" />
            )}
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {isUploadingPicture ? "Uploading..." : "Change Profile Picture"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              disabled={isUploadingPicture}
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800 disabled:file:bg-slate-400"
            />
          </label>
        </motion.section>

        <section className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Account Details</h1>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing ? "Edit your profile information" : "View your profile information"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
              >
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
              </button>
              <button
                type="button"
                onClick={handleSignOutClick}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>

          {showSignOutConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
                <h2 className="text-lg font-semibold text-slate-900">Confirm Sign Out</h2>
                <p className="mt-3 text-sm text-slate-600">Are you sure you want to sign out?</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelSignOut}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowSignOutConfirm(false);
                      await handleSignOut();
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="edit" initial={reduced ? undefined : { opacity: 0, height: 0 }} animate={reduced ? undefined : { opacity: 1, height: "auto" }} exit={reduced ? undefined : { opacity: 0, height: 0 }}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={reduced ? undefined : { opacity: 0 }} animate={reduced ? undefined : { opacity: 1 }}>
                    <p className="mt-1 text-sm font-medium text-slate-900">{fullName || "Not set"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{email || "Not set"}</p>
            </div>

            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Phone Number</p>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="edit" initial={reduced ? undefined : { opacity: 0, height: 0 }} animate={reduced ? undefined : { opacity: 1, height: "auto" }} exit={reduced ? undefined : { opacity: 0, height: 0 }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        if (digits.length <= 11) {
                          setPhone(digits);
                          setPhoneError("");
                        }
                      }}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                      placeholder="09123456789"
                    />
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={reduced ? undefined : { opacity: 0 }} animate={reduced ? undefined : { opacity: 1 }}>
                    <p className="mt-1 text-sm font-medium text-slate-900">{phone || "Not set"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Civil Status</p>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="edit" initial={reduced ? undefined : { opacity: 0, height: 0 }} animate={reduced ? undefined : { opacity: 1, height: "auto" }} exit={reduced ? undefined : { opacity: 0, height: 0 }}>
                    <select
                      value={civilStatus}
                      onChange={(e) => setCivilStatus(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={reduced ? undefined : { opacity: 0 }} animate={reduced ? undefined : { opacity: 1 }}>
                    <p className="mt-1 text-sm font-medium text-slate-900">{civilStatus || "Not set"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </section>
      </div>
    </div>
    </Reveal>
  );
}

export default function Myprofile({ modal = false, onClose }: MyprofileProps) {
  if (modal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div className="relative w-full max-w-4xl">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="absolute -right-2 -top-2 z-10 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-100"
            aria-label="Close profile"
          >
            Close
          </button>
          <ProfileBody />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <ProfileBody />
    </main>
  );
}
