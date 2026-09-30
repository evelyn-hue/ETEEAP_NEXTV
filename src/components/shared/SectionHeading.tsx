"use client";
import { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  level?: "h1" | "h2" | "h3";
  className?: string;
  light?: boolean;
};

export default function SectionHeading({
  children,
  level = "h2",
  className = "",
  light,
}: SectionHeadingProps) {
  const Tag = level;
  const sizeMap = {
    h1: "text-3xl sm:text-4xl",
    h2: "text-2xl sm:text-3xl",
    h3: "text-xl sm:text-2xl",
  };

  const isLight = light ?? (className.includes("text-white") || className.includes("text-slate-100"));
  const textColor = isLight ? "text-white" : "text-primary";
  const underlineColor = isLight ? "bg-white/80" : "bg-primary";
  const isCenter = className.includes("text-center");

  return (
    <div className={`mb-6 ${className}`}>
      <Tag className={`font-display font-bold ${textColor} ${sizeMap[level]}`}>
        {children}
      </Tag>
      <div className={`mt-2 h-1 w-12 ${underlineColor} rounded-full ${isCenter ? "mx-auto" : ""}`} />
    </div>
  );
}
