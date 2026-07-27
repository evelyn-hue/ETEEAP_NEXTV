"use client";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

type StaggerItemProps = { children: ReactNode; className?: string };

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function StaggerItem({ children, className = "" }: StaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
