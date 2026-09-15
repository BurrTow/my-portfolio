import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { pressableVariants } from "@/theme/motion";
import { buttonClassNames, type ButtonVariant } from "@/components/ui/buttonStyles";

interface LinkButtonProps extends ComponentPropsWithoutRef<typeof motion.a> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function LinkButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <motion.a
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={pressableVariants}
      className={`${buttonClassNames(variant)} ${className}`}
      {...props}
    >
      {children}
    </motion.a>
  );
}
