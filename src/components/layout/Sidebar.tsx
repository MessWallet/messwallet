import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  Utensils, 
  Users, 
  Wallet,
  Settings,
  Bell,
  LogOut,
  PiggyBank,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", labelBn: "ড্যাশবোর্ড", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", labelBn: "খরচ", path: "/expenses" },
  { icon: Utensils, label: "Meals", labelBn: "খাবার", path: "/meals" },
  { icon: PiggyBank, label: "Deposits", labelBn: "জমা", path: "/deposits" },
  { icon: Users, label: "Members", labelBn: "সদস্য", path: "/members" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
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
          <div className="relative shrink-0">
            <Wallet className="w-8 h-8 text-primary" />
            <Utensils className="w-4 h-4 text-secondary absolute -bottom-0.5 -right-0.5" />
          </div>
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
