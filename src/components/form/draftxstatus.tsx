"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DraftApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  program_name: string;
  created_at: string;

  // NEW: application status (draft, submitted, under_review, approved, rejected)
  status?: string;
};

type PopupState = {
  open: boolean;
  title: string;
  message: string;
  onConfirm?: (() => void | Promise<void>) | null;
};

type ShowPopupParams = {
  title: string;
  message: string;
  onConfirm?: (() => void | Promise<void>) | null;
};

export default function DraftXStatus() {
  const router = useRouter();

  const [drafts, setDrafts] = useState<DraftApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState<PopupState>({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const res = await fetch("http://localhost:5000/drafts", {
        method: "GET",
        credentials: "include",
        headers: userId ? { "x-user-id": String(userId) } : {},
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      setDrafts(data || []);
    } catch (error) {
      showPopup({
        title: "Error",
        message: "Failed to load applications.",
      });
    }

    setLoading(false);
  };

  const showPopup = ({
    title,
    message,
    onConfirm = null,
  }: ShowPopupParams) => {
    setPopup({ open: true, title, message, onConfirm });
  };

  const closePopup = () => {
    setPopup({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const handleOpenDraft = async (draftId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/drafts/${draftId}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Failed to open");

      sessionStorage.setItem(
        "reviewApplication",
        JSON.stringify({
          formData: data.formData,
          draftId: data.id,
          programName: data.program_name,
        })
      );

      router.push("/reviewapplication");
    } catch {
      showPopup({
        title: "Error",
        message: "Failed to open application.",
      });
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    showPopup({
      title: "Delete Application",
      message: "Are you sure you want to delete this application?",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/drafts/${draftId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (!res.ok) throw new Error();

          setDrafts((prev) =>
            prev.filter((d) => d.id !== draftId)
          );

          showPopup({
            title: "Deleted",
            message: "Application removed.",
          });
        } catch {
          showPopup({
            title: "Error",
            message: "Failed to delete.",
          });
        }
      },
    });
  };

  // UI helper for status badge
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20 mt-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        My Applications
      </h1>

      <p className="text-gray-600 mb-8">
        Drafts and application status overview
      </p>

      {loading ? (
        <div>Loading...</div>
      ) : drafts.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-8 text-center text-gray-500">
          No applications found.
        </div>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white shadow-lg rounded-xl p-6 border"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-blue-700">
                  {draft.program_name}
                </h2>

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    draft.status
                  )}`}
                >
                  {draft.status || "draft"}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-3 text-gray-700">
                <p><strong>Name:</strong> {draft.full_name}</p>
                <p><strong>Email:</strong> {draft.email}</p>
                <p><strong>Phone:</strong> {draft.phone}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Saved: {new Date(draft.created_at).toLocaleString()}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => handleOpenDraft(draft.id)}
                  className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
                >
                  Open
                </button>

                <button
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP */}
      {popup.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">{popup.title}</h2>
            <p>{popup.message}</p>

            <div className="flex justify-end gap-3 mt-6">
              {popup.onConfirm && (
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={async () => {
                  if (popup.onConfirm) await popup.onConfirm();
                  closePopup();
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg"
              >
                {popup.onConfirm ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}