"use client";
import { motion, useReducedMotion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

type PageTransitionProps = { children: ReactNode; className?: string; style?: CSSProperties };

export default function PageTransition({ children, className = "", style }: PageTransitionProps) {
  const reduced = useReducedMotion();

  if (reduced) return <main className={className} style={style}>{children}</main>;

  return (
    <motion.main
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.main>
  );
}
