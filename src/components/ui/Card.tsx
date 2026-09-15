import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { pressableVariants } from "@/theme/motion";
import { FOCUS_RING } from "@/components/ui/buttonStyles";

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
      className={`notched p-5 [--fill:theme(colors.p3-black.panel)] hover:[--edge:theme(colors.p3-red.DEFAULT)] hover:[--fill:theme(colors.p3-black.raised)] ${FOCUS_RING} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
