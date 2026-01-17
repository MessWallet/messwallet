import { Bell, Search, Menu } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  titleBn?: string;
  onMenuClick?: () => void;
}

export const Header = ({ title, titleBn, onMenuClick }: HeaderProps) => {
  const { profile, userRole } = useAuth();

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

          <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {profile && (
            <div className="flex items-center gap-3">
              <img src={profile.avatar_url} alt="Profile" className="w-10 h-10 rounded-xl border border-white/20 object-cover" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile.full_name}</p>
                {userRole && <RoleBadge role={userRole.role} className="mt-0.5" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
