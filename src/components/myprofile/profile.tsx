"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import { useAuth } from "@/context/AuthContext";
import api_link from "@/config/api_link.json";
import imgSrc from "@/config/img_src.json";

type MyprofileProps = {
  modal?: boolean;
  onClose?: () => void;
};

function ProfileBody() {
  const router = useRouter();
  const { email, fullName: authFullName, phone: authPhone, civil_status: authCivilStatus, profilePicture: authProfilePicture, loading: authLoading, refreshAuth } = useAuth();
  const [preview, setPreview] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Editable fields
  const [fullName, setFullName] = useState(authFullName || "");
  const [phone, setPhone] = useState(authPhone || "");
  const [civilStatus, setCivilStatus] = useState(authCivilStatus || "");

  useEffect(() => {
    if (!authLoading) {
      if (authProfilePicture && !preview) {
        setPreview(authProfilePicture);
      } else if (!authProfilePicture && !preview) {
        setPreview(imgSrc.heroImage);
      }
    }
  }, [authProfilePicture, authLoading]);

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

    setIsUploadingPicture(true);
    setErrorMessage("");

    try {
      const result = await Fetch_toFile(
        "/services/supabase/auth/upload-profile-picture",
        { file, fields: { email } }
      );

      if (result.success) {
        const newPictureUrl = result.data.profilePictureUrl;
        console.log("Upload successful. New picture URL:", newPictureUrl);
        // Update preview immediately with the returned URL
        setPreview(newPictureUrl);
        setSuccessMessage("Profile picture updated successfully!");
        // Refresh auth to update the context (for header)
        await refreshAuth();
        console.log("Auth refreshed");
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
    }
  };

  const handleSaveProfile = async () => {
    if (!email) {
      setErrorMessage("Email not found. Please log in again.");
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

  const handleSignOut = async () => {
    try {
      const response = await Fetch_to(api_link.jwt.deauth);
      if (response.success) {
        router.push("/auth/signin");
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setErrorMessage("Failed to sign out");
    }
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
        <section className="shrink-0">
          <div className="h-36 w-36 overflow-hidden rounded-3xl border-4 border-white bg-slate-200 shadow-lg">
            <Image
              key={`modal-profile-${preview}`}
              src={preview || imgSrc.heroImage}
              alt="Profile picture"
              width={300}
              height={300}
              className="h-full w-full object-cover"
              unoptimized
            />
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
        </section>

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
                onClick={handleSignOut}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-slate-900">{fullName || "Not set"}</p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{email || "Not set"}</p>
            </div>

            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Phone Number</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="+63 912 345 6789"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-slate-900">{phone || "Not set"}</p>
              )}
            </div>

            <div className={isEditing ? "rounded-2xl border-2 border-blue-300 bg-blue-50 p-4" : "rounded-2xl bg-slate-50 p-4"}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Civil Status</p>
              {isEditing ? (
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
              ) : (
                <p className="mt-1 text-sm font-medium text-slate-900">{civilStatus || "Not set"}</p>
              )}
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
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <ProfileBody />
    </main>
  );
}
