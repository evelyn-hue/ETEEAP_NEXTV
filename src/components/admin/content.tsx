"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Fetch_to from "@/utilities/Fetch_to";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import Skeleton from "@/components/shared/Skeleton";

type PostType = "blog" | "video" | "event";

type Post = {
  id: string;
  type: PostType;
  title: string;
  body: string | null;
  cover_image: string | null;
  video_url: string | null;
  event_date: string | null;
  event_location: string | null;
  status: "draft" | "published";
  created_at: string;
};

type Toast = { message: string; type: "success" | "error" | "info" };

type PendingAction = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  execute: () => void;
};

const TYPE_LABELS: Record<PostType, string> = {
  blog: "Blogs",
  video: "Videos",
  event: "Events",
};

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-bold ${editor.isActive("bold") ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm italic ${editor.isActive("italic") ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-sm font-semibold ${editor.isActive("heading", { level: 2 }) ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm ${editor.isActive("bulletList") ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm ${editor.isActive("orderedList") ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          1. List
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose max-w-none px-3 py-2 text-sm text-slate-900 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}

export default function AdminContent() {
  const reduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<PostType>("blog");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [editing, setEditing] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formType, setFormType] = useState<PostType>("blog");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");

  const showToast = (message: string, type: Toast["type"] = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const openConfirmation = (action: PendingAction) => setPendingAction(action);
  const closeConfirmation = () => setPendingAction(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await Fetch_to("/services/supabase/content/retrieve", {});
      const rows = Array.isArray(result.data) ? result.data : (result.data?.data || []);
      setPosts(rows as Post[]);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = useMemo(
    () => posts.filter((p) => p.type === activeTab),
    [posts, activeTab]
  );

  const resetForm = () => {
    setTitle("");
    setBody("");
    setCoverImage("");
    setVideoUrl("");
    setEventDate("");
    setEventLocation("");
    setFormStatus("draft");
  };

  const openCreate = (type: PostType) => {
    setFormType(type);
    setEditing(null);
    setIsCreating(true);
    resetForm();
  };

  const openEdit = (post: Post) => {
    setFormType(post.type);
    setEditing(post);
    setIsCreating(true);
    setTitle(post.title);
    setBody(post.body || "");
    setCoverImage(post.cover_image || "");
    setVideoUrl(post.video_url || "");
    setEventDate(post.event_date || "");
    setEventLocation(post.event_location || "");
    setFormStatus(post.status);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const handleUploadCover = async (file: File) => {
    setUploading(true);
    try {
      const result = await Fetch_toFile(
        "/services/supabase/content/upload",
        { file, fields: {} },
        {}
      );
      if (result.success) {
        const url = result.data?.url || result.data?.data?.url;
        if (url) {
          setCoverImage(url);
          showToast("Image uploaded.", "success");
        }
      } else {
        showToast(result.message || "Upload failed.", "error");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    if (formType === "video" && !videoUrl.trim()) {
      showToast("Video URL is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: formType,
        title: title.trim(),
        body: body || "",
        cover_image: coverImage,
        video_url: videoUrl,
        event_date: eventDate,
        event_location: eventLocation,
        status: formStatus,
      };

      const result = editing
        ? await Fetch_to("/services/supabase/content/update", { id: editing.id, ...payload })
        : await Fetch_to("/services/supabase/content/create", payload);

      if (result.success) {
        showToast(editing ? "Content updated." : "Content created.", "success");
        closeForm();
        fetchPosts();
      } else {
        showToast(result.message || "Save failed.", "error");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (post: Post) => {
    const next = post.status === "published" ? "draft" : "published";
    openConfirmation({
      title: next === "published" ? "Publish Content" : "Unpublish Content",
      message: `Are you sure you want to ${next === "published" ? "publish" : "unpublish"} "${post.title}"?`,
      confirmLabel: next === "published" ? "Publish" : "Unpublish",
      cancelLabel: "Cancel",
      execute: () => void updateStatus(post.id, next),
    });
  };

  const updateStatus = async (id: string, status: "draft" | "published") => {
    const result = await Fetch_to("/services/supabase/content/update", { id, status });
    if (result.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      showToast("Status updated.", "success");
    } else {
      showToast(result.message || "Update failed.", "error");
    }
  };

  const requestDelete = (post: Post) => {
    openConfirmation({
      title: "Delete Content",
      message: `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      execute: () => void deletePost(post.id),
    });
  };

  const deletePost = async (id: string) => {
    const result = await Fetch_to("/services/supabase/content/delete", { id });
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Content deleted.", "success");
    } else {
      showToast(result.message || "Delete failed.", "error");
    }
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "-";

  return (
    <main className="min-h-screen bg-section-warm p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Content</p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 font-display">Manage Content</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage blogs, videos, and events.</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(["blog", "video", "event"] as PostType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => openCreate(activeTab)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FiPlus />
            Add {activeTab === "blog" ? "Blog" : activeTab === "video" ? "Video" : "Event"}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/30">
            No {TYPE_LABELS[activeTab].toLowerCase()} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                    {post.type === "video" && post.video_url ? (
                      <p className="mt-1 truncate text-xs text-slate-500">{post.video_url}</p>
                    ) : null}
                    {post.type === "event" ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(post.event_date)} {post.event_location ? `· ${post.event_location}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(post)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {post.status === "published" ? <FiEyeOff /> : <FiEye />}
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(post)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isCreating ? (
            <motion.div
              initial={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeForm();
              }}
            >
              <div className="w-full h-full rounded-none bg-white shadow-2xl overflow-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editing ? "Edit" : "Add"}{" "}
                    {formType === "blog" ? "Blog" : formType === "video" ? "Video" : "Event"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="mx-auto max-w-3xl space-y-6 p-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  {formType === "video" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Video URL (YouTube / Vimeo / Google Drive)
                      </label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  ) : null}

                  {formType === "event" ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Event Date</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Location</label>
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Venue"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      {formType === "blog" ? "Body" : "Description"}
                    </label>
                    <RichTextEditor value={body} onChange={setBody} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cover Image</label>
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="mb-2 h-32 w-full rounded-xl object-cover"
                      />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) void handleUploadCover(file);
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                    {uploading ? <p className="mt-1 text-xs text-slate-500">Uploading...</p> : null}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "draft" | "published")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openConfirmation({
                          title: editing ? "Save Changes" : "Create Content",
                          message: `Are you sure you want to ${editing ? "save changes to" : "create"} "${title || "this content"}"?`,
                          confirmLabel: editing ? "Save" : "Create",
                          cancelLabel: "Cancel",
                          execute: () => void save(),
                        })
                      }
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {pendingAction ? (
            <motion.div
              initial={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeConfirmation();
              }}
            >
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">{pendingAction.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{pendingAction.message}</p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeConfirmation}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {pendingAction.cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      pendingAction.execute();
                      closeConfirmation();
                    }}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {pendingAction.confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border bg-white p-4 shadow-2xl ring-1 ring-slate-200/30">
          <div className={`flex items-start gap-3 ${toast.type === "success" ? "text-green-900" : toast.type === "error" ? "text-red-900" : "text-slate-900"}`}>
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-slate-400"}`} />
            <div>
              <p className="font-semibold">{toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Info"}</p>
              <p className="mt-1 text-sm leading-6">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
