import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  Utensils, 
  Users, 
  LogOut,
  PiggyBank,
  ChevronLeft,
  Shield,
  History,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", labelBn: "ড্যাশবোর্ড", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", labelBn: "খরচ", path: "/expenses" },
  { icon: Utensils, label: "Meals", labelBn: "খাবার", path: "/meals" },
  { icon: PiggyBank, label: "Deposits", labelBn: "জমা", path: "/deposits" },
  { icon: Users, label: "Members", labelBn: "সদস্য", path: "/members" },
  { icon: History, label: "History", labelBn: "ইতিহাস", path: "/history" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
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
