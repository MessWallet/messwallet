import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "balance";
  style?: CSSProperties;
}

export const GlassCard = ({ children, className, variant = "default", style, ...props }: GlassCardProps) => {
  const variants = {
    default: "glass-card",
    strong: "glass-card-strong",
    balance: "balance-card",
  };

  return (
    <div className={cn(variants[variant], className)} style={style} {...props}>
      {children}
    </div>
  );
};
