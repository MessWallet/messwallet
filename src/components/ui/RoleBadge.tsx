import { cn } from "@/lib/utils";

type Role = "founder" | "secondary_admin" | "tertiary_admin" | "admin" | "member";

interface RoleBadgeProps {
  role: Role;
  className?: string;
  size?: "xs" | "sm" | "md";
}

const roleLabels: Record<Role, string> = {
  founder: "Founder",
  secondary_admin: "Admin",
  tertiary_admin: "Admin",
  admin: "Admin",
  member: "Member",
};

const roleStyles: Record<Role, string> = {
  founder: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  secondary_admin: "bg-primary/20 text-primary border-primary/30",
  tertiary_admin: "bg-primary/20 text-primary border-primary/30",
  admin: "bg-primary/20 text-primary border-primary/30",
  member: "bg-white/10 text-muted-foreground border-white/20",
};

export const RoleBadge = ({ role, className, size = "md" }: RoleBadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full font-medium uppercase tracking-wider border",
        size === "xs" ? "px-1 py-0.5 text-[6px]" : size === "sm" ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[10px]",
        roleStyles[role],
        className
      )}
    >
      {roleLabels[role]}
    </span>
  );
};
