import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { pressableVariants } from "@/theme/motion";
import { buttonClassNames, type ButtonVariant } from "@/components/ui/buttonStyles";

interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={pressableVariants}
      className={`${buttonClassNames(variant)} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
