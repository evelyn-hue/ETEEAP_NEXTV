"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Fetch_to from "@/utilities/Fetch_to";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

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
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <SectionHeading level="h1">Admin Settings</SectionHeading>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      ) : (
        <Reveal>
        <div className="bg-white shadow-sm ring-1 ring-slate-200/30 rounded-2xl p-6 border border-gray-200">
          <motion.div className="flex items-center gap-6 mb-8" whileHover={reduced ? undefined : { scale: 1.05 }}>
            <Image
              src={avatarUrl || "/bruma.jpg"}
              alt="Profile"
              width={112}
              height={112}
              className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-md"
            />

            <label className="cursor-pointer bg-blue-600 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md transition disabled:opacity-60"
              style={{ pointerEvents: uploading ? "none" : "auto" }}>
              {uploading ? "Uploading..." : "Change Photo"}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
          </motion.div>

          <div className="mb-6 relative">
            <label className="block text-gray-700 font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
            <Pencil className="absolute right-3 top-9 w-5 h-5 text-gray-500" />
          </div>

          <div className="mb-6 relative">
            <label className="block text-gray-700 font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email || ""}
              disabled
              className="w-full border px-4 py-3 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <button 
              onClick={handleSaveChanges}
              disabled={saving || uploading}
              className="bg-blue-600 hover:bg-blue-600 text-white px-10 py-4 rounded-xl shadow-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        </Reveal>
      )}
    </div>
  );
}
