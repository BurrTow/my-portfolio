import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { pressableVariants } from "@/theme/motion";

interface CardProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
}

/** Shared hoverable/tappable surface for project, cert, and repo cards. */
export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={pressableVariants}
      className={`notched p-5 [--fill:theme(colors.beige.light)] hover:[--fill:theme(colors.beige.DEFAULT)] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
