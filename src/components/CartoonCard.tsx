import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CartoonCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gold" | "red" | "tilted";
  onClick?: () => void;
}

export const CartoonCard = ({
  children,
  className,
  variant = "default",
  onClick,
}: CartoonCardProps) => {
  const variants = {
    default: "cartoon-border bg-card",
    gold: "cartoon-border-gold bg-card",
    red: "border-4 border-chip-red bg-card cartoon-shadow rounded-2xl",
    tilted: "cartoon-border bg-card tilt-left",
  };

  return (
    <div
      className={cn(
        "p-4 transition-transform",
        variants[variant],
        onClick && "cursor-pointer wobble-hover",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
