"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import api from "@/api/axios";

interface StoredUser {
  id?: number | string;
  role?: string;
  fullname?: string;
  email?: string;
  profile_picture?: string;
}

interface UserState {
  fullname: string;
  email: string;
  password: string;
  image: string | null;
  imageFile: File | null;
}

interface EditableState {
  fullname: boolean;
  email: boolean;
}

interface ProfileResponse {
  fullname?: string;
  email?: string;
  profile_picture?: string;
}

interface UpdateProfileResponse {
  message?: string;
  user: {
    fullname: string;
    email: string;
    profile_picture?: string;
  };
}

const AdminSettings = () => {
  const [storedUser, setStoredUser] = useState<StoredUser>({});
  const [userId, setUserId] = useState<number | string | null>(null);
  const [role, setRole] = useState<string>("");

  const [user, setUser] = useState<UserState>({
    fullname: "",
    email: "",
    password: "",
    image: null,
    imageFile: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [editable, setEditable] = useState<EditableState>({
    fullname: false,
    email: false,
  });

  // Load user from localStorage safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");

      if (stored) {
        const parsed: StoredUser = JSON.parse(stored);

        setStoredUser(parsed);
        setUserId(parsed.id || null);
        setRole(parsed.role || "");
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Fetch profile
  const fetchProfile = async () => {
    if (!userId || role !== "admin") {
      setMessage("No admin ID found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<ProfileResponse>("/admin/profile", {
        headers: {
          "x-user-id": userId,
        },
      });

      const data = res.data;

      setUser({
        fullname: data.fullname || "",
        email: data.email || "",
        password: "",
        image: data.profile_picture || null,
        imageFile: null,
      });

      // Update localStorage
      const updatedUser = {
        ...storedUser,
        fullname: data.fullname,
        email: data.email,
        profile_picture: data.profile_picture,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Notify dashboard
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: {
            fullname: data.fullname,
            profile_picture: data.profile_picture,
          },
        })
      );
    } catch (err: any) {
      console.error(
        "Error fetching profile:",
        err.response?.data || err.message
      );

      setMessage("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && role) {
      fetchProfile();
    }
  }, [userId, role]);

  // Input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // Image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setUser({
        ...user,
        image: URL.createObjectURL(file),
        imageFile: file,
      });
    }
  };

  // Toggle editable
  const toggleEditable = (field: keyof EditableState) => {
    setEditable((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save profile
  const handleSave = async () => {
    if (!userId) {
      setMessage("No admin ID found. Please log in.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("fullname", user.fullname);
      formData.append("email", user.email);

      if (user.password.trim() !== "") {
        formData.append("password", user.password);
      }

      if (user.imageFile) {
        formData.append("profile_picture", user.imageFile);
      }

      const res = await api.put<UpdateProfileResponse>(
        "/admin/profile",
        formData,
        {
          headers: {
            "x-user-id": userId,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message || "Profile updated successfully!");

      // Reset password
      setUser((prev) => ({
        ...prev,
        password: "",
        imageFile: null,
      }));

      // Reset editable state
      setEditable({
        fullname: false,
        email: false,
      });

      // Update localStorage
      const updatedUser = {
        ...storedUser,
        fullname: res.data.user.fullname,
        email: res.data.user.email,
        profile_picture: res.data.user.profile_picture,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Notify app
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: {
            fullname: res.data.user.fullname,
            profile_picture: res.data.user.profile_picture,
          },
        })
      );

      // Refresh profile
      fetchProfile();
    } catch (err: any) {
      console.error(
        "Error updating profile:",
        err.response?.data || err.message
      );

      setMessage(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">
        👤 Admin Settings
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        {/* Profile Image */}
        <div className="flex items-center gap-6 mb-8">
          <Image
            src={user.image || "/bruma.jpg"}
            alt="Profile"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-md"
          />

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition">
            Change Photo

            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Full Name */}
        <div className="mb-6 relative">
          <label className="block text-gray-700 font-semibold mb-1">
            Full Name
          </label>

          <input
            type="text"
            name="fullname"
            value={user.fullname}
            onChange={handleChange}
            readOnly={!editable.fullname}
            className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition ${
              editable.fullname
                ? "bg-white"
                : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <Pencil
            className="absolute right-3 top-9 w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600"
            onClick={() => toggleEditable("fullname")}
          />
        </div>

        {/* Email */}
        <div className="mb-6 relative">
          <label className="block text-gray-700 font-semibold mb-1">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            readOnly={!editable.email}
            className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition ${
              editable.email
                ? "bg-white"
                : "bg-gray-100 cursor-not-allowed"
            }`}
          />

          <Pencil
            className="absolute right-3 top-9 w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600"
            onClick={() => toggleEditable("email")}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-1">
            New Password
          </label>

          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-700 hover:bg-blue-600 text-white px-10 py-4 rounded-xl shadow-xl font-semibold transition transform hover:-translate-y-1 disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-green-600 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;