"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Fetch_to from "@/utilities/Fetch_to";
import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

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

function toEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Google Drive share link -> preview
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

  // Already an embeddable iframe url (rare) or fall back to the raw url
  return trimmed;
}

export default function PublicContent() {
  const [tab, setTab] = useState<PostType>("blog");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await Fetch_to("/services/supabase/content/retrieve", {});
        const rows = Array.isArray(result.data) ? result.data : (result.data?.data || []);
        const published = (rows as Post[]).filter((p) => p.status === "published");
        setPosts(published);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => posts.filter((p) => p.type === tab),
    [posts, tab]
  );

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";

  const tabs: { key: PostType; label: string }[] = [
    { key: "blog", label: "Blogs" },
    { key: "video", label: "Videos" },
    { key: "event", label: "Events" },
  ];

  return (
    <main>
      <section className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-primary md:h-72">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6 text-center">
          <SectionEyebrow className="text-white/80">Updates</SectionEyebrow>
          <h1 className="text-4xl font-bold text-white font-display md:text-5xl">News &amp; Events</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Latest blogs, videos, and events from the LCCB ETEEAP community.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-600">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-600">
            No {tabs.find((t) => t.key === tab)?.label.toLowerCase()} published yet.
          </p>
        ) : tab === "video" ? (
          <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => {
              const embed = post.video_url ? toEmbedUrl(post.video_url) : null;
              return (
                <StaggerItem key={post.id}>
                  <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/30">
                    {embed ? (
                      <div className="aspect-video">
                        <iframe
                          src={embed}
                          title={post.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : post.cover_image ? (
                      <div className="relative aspect-video">
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <h3 className="font-bold text-primary">{post.title}</h3>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="space-y-6">
            {filtered.map((post) => (
              <Reveal key={post.id}>
                <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/30">
                  {post.cover_image ? (
                    <div className="relative h-56 w-full">
                      <Image src={post.cover_image} alt={post.title} fill className="object-cover" unoptimized />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-primary">{post.title}</h2>
                    {post.type === "event" ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(post.event_date)}
                        {post.event_location ? ` · ${post.event_location}` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">{formatDate(post.created_at)}</p>
                    )}
                    {post.body ? (
                      <div
                        className="prose mt-4 max-w-none text-sm text-slate-700"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                      />
                    ) : null}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
