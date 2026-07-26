"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import InstallPrompt from "@/components/common/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

function PwaMeta() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.json";
    document.head.appendChild(manifest);

    const themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    themeColor.content = "#1e3a5f";
    document.head.appendChild(themeColor);

    const appleCapable = document.createElement("meta");
    appleCapable.name = "apple-mobile-web-app-capable";
    appleCapable.content = "yes";
    document.head.appendChild(appleCapable);

    const appleStatusBar = document.createElement("meta");
    appleStatusBar.name = "apple-mobile-web-app-status-bar-style";
    appleStatusBar.content = "black-translucent";
    document.head.appendChild(appleStatusBar);

    const appleTitle = document.createElement("meta");
    appleTitle.name = "apple-mobile-web-app-title";
    appleTitle.content = "ETEEAP";
    document.head.appendChild(appleTitle);

    const sw = navigator.serviceWorker;
    if (sw && !sw.controller) {
      sw.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaMeta />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
        <AuthProvider>
          {children}
        </AuthProvider>
        </GoogleOAuthProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
