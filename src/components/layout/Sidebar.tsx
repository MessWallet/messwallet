import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  Utensils, 
  Users, 
  LogOut,
  PiggyBank,
  ChevronLeft,
  ChevronDown,
  Shield,
  History,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", labelBn: "ড্যাশবোর্ড", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", labelBn: "খরচ", path: "/expenses" },
  { icon: Utensils, label: "Meals", labelBn: "খাবার", path: "/meals" },
  { icon: PiggyBank, label: "Deposits", labelBn: "জমা", path: "/deposits" },
  { icon: History, label: "History", labelBn: "ইতিহাস", path: "/history" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();
  const { data: members } = useMembers();
  const [collapsed, setCollapsed] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleMemberClick = (userId: string) => {
    navigate(`/member/${userId}`);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border",
        "flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="MessWallet" className="w-10 h-10 object-contain" />
          {!collapsed && (
            <span className="text-xl font-bold text-gradient-primary">MessWallet</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={cn("nav-item", isActive && "active")}>
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <div>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground block font-bengali">{item.labelBn}</span>
                </div>
              )}
            </Link>
          );
        })}

        {/* Members Section with Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => setMembersExpanded(!membersExpanded)}
            className={cn(
              "nav-item w-full justify-between",
              location.pathname === "/members" && "active"
            )}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <div className="text-left">
                  <span className="font-medium">Members</span>
                  <span className="text-xs text-muted-foreground block font-bengali">সদস্য</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <motion.div
                animate={{ rotate: membersExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </button>

          {/* Members List */}
          <AnimatePresence>
            {membersExpanded && !collapsed && members && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ScrollArea className="max-h-[200px]">
                  <div className="pl-4 space-y-1 py-1">
                    {/* View All Button */}
                    <Link
                      to="/members"
                      className="flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-white/10 transition-colors text-primary"
                    >
                      <Users className="w-3 h-3" />
                      <span>View All Members</span>
                    </Link>

                    {/* Individual Members - sorted by serial */}
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleMemberClick(member.user_id)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
                      >
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{member.full_name}</p>
                          <RoleBadge role={member.role} size="xs" />
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        {isAdmin && (
          <Link 
            to="/admin" 
            className={cn("nav-item", location.pathname === "/admin" && "active")}
          >
            <Shield className="w-5 h-5" />
            {!collapsed && (
              <div>
                <span className="font-medium">Admin Panel</span>
                <span className="text-xs text-muted-foreground block font-bengali">অ্যাডমিন</span>
              </div>
            )}
          </Link>
        )}
        
        {/* Profile Button */}
        <Link 
          to="/profile" 
          className={cn("nav-item", location.pathname === "/profile" && "active")}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
          {!collapsed && <span className="font-medium">Profile</span>}
        </Link>

        <button onClick={handleLogout} className="nav-item w-full text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 p-1.5 rounded-full bg-sidebar border border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
};
