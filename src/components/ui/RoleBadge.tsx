import { cn } from "@/lib/utils";

type Role = "founder" | "secondary_admin" | "tertiary_admin" | "admin" | "member";

interface RoleBadgeProps {
  role: Role;
  className?: string;
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

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border",
        roleStyles[role],
        className
      )}
    >
      {roleLabels[role]}
    </span>
  );
};
