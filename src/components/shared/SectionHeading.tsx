"use client";
import { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  level?: "h1" | "h2" | "h3";
  className?: string;
};

export default function SectionHeading({ children, level = "h2", className = "" }: SectionHeadingProps) {
  const Tag = level;
  const sizeMap = { h1: "text-3xl sm:text-4xl", h2: "text-2xl sm:text-3xl", h3: "text-xl sm:text-2xl" };
  return (
    <div className={`mb-6 ${className}`}>
      <Tag className={`font-display font-bold text-primary ${sizeMap[level]}`}>
        {children}
      </Tag>
      <div className="mt-2 h-1 w-12 bg-primary rounded-full" />
    </div>
  );
}
