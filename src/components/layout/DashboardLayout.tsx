import { ReactNode, useState, forwardRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  titleBn?: string;
}

export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, title, titleBn }, ref) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
      <div ref={ref} className="min-h-screen bg-nature">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "lg:block",
          sidebarOpen ? "block" : "hidden"
        )}>
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="lg:ml-64 min-h-screen">
          <Header 
            title={title} 
            titleBn={titleBn}
            onMenuClick={() => setSidebarOpen(true)} 
          />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";
