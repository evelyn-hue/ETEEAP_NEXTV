"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Fetch_to from "@/utilities/Fetch_to";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import Reveal from "@/components/shared/Reveal";
import Skeleton from "@/components/shared/Skeleton";

export default function AdminSettings() {
  const reduced = useReducedMotion();
  const { email } = useAuth();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<null | {
    kind: "save" | "photo";
    file?: File;
  }>(null);

  // Fetch admin settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const result = await Fetch_to("/services/supabase/admin_settings/retrieve", {});
        
        const settingsData = result.data?.data || result.data;
        if (result.success && settingsData) {
          setFullName(settingsData.full_name || "");
          setAvatarUrl(settingsData.avatar_url || "/bruma.jpg");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setErrorMessage("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Full name is required");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await Fetch_to("/services/supabase/admin_settings/update", {
        full_name: fullName,
      });

      if (result.success) {
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to save settings");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await Fetch_toFile(
        "/services/supabase/admin_settings/upload-avatar",
        { file, fields: {} },
        {
          onProgress: (progress) => {
          },
        }
      );

      if (result.success) {
        const updatedData = result.data?.data || result.data;
        if (updatedData?.avatar_url) {
          setAvatarUrl(updatedData.avatar_url);
        }
        setSuccessMessage("Photo uploaded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Failed to upload photo");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  const onPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setPendingConfirm({ kind: "photo", file });
  };
  return (
    <div className="min-h-screen bg-section-warm p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Configuration</p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 font-display">Admin Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your admin profile and preferences.</p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800 ring-1 ring-green-200">{successMessage}</div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">{errorMessage}</div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200/30">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : (
          <Reveal>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/30 sm:p-8">
            <motion.div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8" whileHover={reduced ? undefined : { scale: 1.05 }}>
              <Image
                src={avatarUrl || "/bruma.jpg"}
                alt="Profile"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover shadow-md"
              />

              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-60"
                style={{ pointerEvents: uploading ? "none" : "auto" }}>
                {uploading ? "Uploading..." : "Change Photo"}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={onPhotoSelected}
                  disabled={uploading}
                />
              </label>
            </motion.div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition outline-none"
                />
                <Pencil className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setPendingConfirm({ kind: "save" })}
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          </Reveal>
        )}
      </div>

      {pendingConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {pendingConfirm.kind === "save" ? "Confirm Save" : "Confirm Photo Upload"}
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              {pendingConfirm.kind === "save"
                ? "Are you sure you want to save these changes?"
                : "Are you sure you want to change your profile photo?"}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingConfirm.kind === "save") {
                    setPendingConfirm(null);
                    void handleSaveChanges();
                  } else if (pendingConfirm.file) {
                    const file = pendingConfirm.file;
                    setPendingConfirm(null);
                    void handlePhotoUpload(file);
                  }
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
