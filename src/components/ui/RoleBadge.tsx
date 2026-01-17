import { cn } from "@/lib/utils";

type Role = "founder" | "admin" | "member";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleLabels: Record<Role, string> = {
  founder: "Founder",
  admin: "Admin",
  member: "Member",
};

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  return (
    <span className={cn("role-badge", role, className)}>
      {roleLabels[role]}
    </span>
  );
};
