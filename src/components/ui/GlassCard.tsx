import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "balance";
  style?: CSSProperties;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = "default", style, ...props }, ref) => {
    const variants = {
      default: "glass-card",
      strong: "glass-card-strong",
      balance: "balance-card",
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} style={style} {...props}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
