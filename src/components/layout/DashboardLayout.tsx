import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { SocialAccountsPanel } from "@/components/social/SocialAccountsPanel";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-4">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3">
            <NotificationPanel />
            <SocialAccountsPanel />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
