"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (window.innerWidth < 768) setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    (deferredPrompt as Event & { prompt: () => void }).prompt();
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || !isMobile) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-900 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-bounce">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        <span className="text-lg font-bold">E</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Install ETEEAP NEXTV</p>
        <p className="text-xs text-blue-200">Add to home screen for quick access</p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
      >
        Install
      </button>
      <button
        type="button"
        onClick={() => setShowPrompt(false)}
        className="p-1 text-blue-300 hover:text-white shrink-0"
        aria-label="Dismiss install prompt"
      >
        <X size={18} />
      </button>
    </div>
  );
}
