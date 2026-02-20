import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CartoonButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
}

export const CartoonButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
}: CartoonButtonProps) => {
  const variants = {
    primary:
      "bg-primary text-primary-foreground border-primary-foreground/30 hover:brightness-110",
    secondary:
      "bg-secondary text-secondary-foreground border-secondary-foreground/30 hover:brightness-110",
    accent:
      "bg-accent text-accent-foreground border-accent-foreground/30 hover:brightness-110",
    danger:
      "bg-destructive text-destructive-foreground border-destructive-foreground/30 hover:brightness-110",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  return (
    <button
      className={cn(
        "font-display tracking-wider border-[3px] rounded-xl cartoon-shadow transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
