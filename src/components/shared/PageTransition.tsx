"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type PageTransitionProps = { children: ReactNode; className?: string };

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const reduced = useReducedMotion();

  if (reduced) return <main className={className}>{children}</main>;

  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.main>
  );
}
