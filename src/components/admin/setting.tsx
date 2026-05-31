import Image from "next/image";
import { Pencil } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">
        Admin Settings
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-6 mb-8">
          <Image
            src="/bruma.jpg"
            alt="Profile"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-md"
          />

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition">
            Change Photo
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 font-semibold mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            defaultValue="Admin User"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition bg-gray-100"
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
            defaultValue="admin@example.com"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition bg-gray-100"
          />
          <Pencil className="absolute right-3 top-9 w-5 h-5 text-gray-500" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-1">
            New Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Leave blank to keep current password"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <button className="bg-blue-700 hover:bg-blue-600 text-white px-10 py-4 rounded-xl shadow-xl font-semibold transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
