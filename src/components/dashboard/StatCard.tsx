import { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  titleBn?: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export const StatCard = ({ 
  title, 
  titleBn, 
  value, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-primary/20 text-primary border-primary/30",
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    danger: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <GlassCard className="p-4 hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg border", variantStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {titleBn && (
          <p className="text-xs text-muted-foreground/60 font-bengali">{titleBn}</p>
        )}
      </div>
    </GlassCard>
  );
};
