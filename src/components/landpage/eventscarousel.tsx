"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Calendar, MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Fetch_to from "@/utilities/Fetch_to";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";

type EventPost = {
  id: string;
  title: string;
  body: string | null;
  cover_image: string | null;
  event_date: string | null;
  event_location: string | null;
};

export default function EventsCarousel() {
  const reduced = useReducedMotion();
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await Fetch_to("/services/supabase/content/retrieve", {
          type: "event",
          status: "published",
        });
        const rows = Array.isArray(result.data) ? result.data : (result.data?.data || []);
        setEvents((rows as EventPost[]).filter((p) => p.title));
      } catch {
        setError("Unable to load upcoming events.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const goTo = (index: number) => {
    if (events.length === 0) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex((index + events.length) % events.length);
  };

  const formatDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : "";

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <SectionEyebrow className="text-center">Events</SectionEyebrow>
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading upcoming events...</span>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const current = events[activeIndex];

  return (
    <section className="py-20 bg-section-warm">
      <div className="max-w-7xl mx-auto px-6">
        <SectionEyebrow className="text-center">What&apos;s Happening</SectionEyebrow>
        <SectionHeading className="text-center mb-10">Upcoming Events</SectionHeading>
        {error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="relative mx-auto max-w-3xl">
              <div className="grid rounded-2xl overflow-hidden shadow-lg">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={current.id}
                    custom={direction}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 80 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -80 }}
                    transition={{ duration: 0.35 }}
                    className="col-start-1 row-start-1 flex flex-col md:flex-row bg-white"
                  >
                    {current.cover_image ? (
                      <div className="relative h-56 md:h-auto md:w-1/2 shrink-0 bg-gray-200">
                        <Image
                          src={current.cover_image}
                          alt={current.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-slate-900 font-display">
                        {current.title}
                      </h3>
                      {(current.event_date || current.event_location) && (
                        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                          {current.event_date ? (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              {formatDate(current.event_date)}
                            </p>
                          ) : null}
                          {current.event_location ? (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              {current.event_location}
                            </p>
                          ) : null}
                        </div>
                      )}
                      {current.body ? (
                        <p className="mt-4 text-sm text-slate-600 line-clamp-3">{current.body}</p>
                      ) : null}
                      <Link
                        href="/news"
                        className="mt-6 inline-block w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        View Event
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {events.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous event"
                    onClick={() => goTo(activeIndex - 1)}
                    className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white p-2.5 shadow-lg text-slate-800 transition-transform hover:scale-110"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next event"
                    onClick={() => goTo(activeIndex + 1)}
                    className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white p-2.5 shadow-lg text-slate-800 transition-transform hover:scale-110"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
            </div>

            {events.length > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                {events.map((event, index) => (
                  <button
                    key={event.id}
                    type="button"
                    aria-label={`Go to ${event.title}`}
                    onClick={() => goTo(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "w-8 bg-blue-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
