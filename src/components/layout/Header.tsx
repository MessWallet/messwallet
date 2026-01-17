import { Link } from "react-router-dom";
import { Bell, Search, Menu } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useNotifications";

interface HeaderProps {
  title: string;
  titleBn?: string;
  onMenuClick?: () => void;
}

export const Header = ({ title, titleBn, onMenuClick }: HeaderProps) => {
  const { profile, userRole } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  return (
    <header className="sticky top-0 z-40 glass-card rounded-none border-0 border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {titleBn && <p className="text-sm text-muted-foreground font-bengali">{titleBn}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-muted-foreground" />
          </div>

          <Link to="/history" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {profile && (
            <Link to="/profile" className="flex items-center gap-3">
              <img src={profile.avatar_url} alt="Profile" className="w-10 h-10 rounded-xl border border-white/20 object-cover" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile.full_name}</p>
                {userRole && <RoleBadge role={userRole.role} className="mt-0.5" />}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
