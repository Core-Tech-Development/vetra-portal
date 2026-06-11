import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageContainer } from "./PageContainer";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  pageTitle?: string;
}

export function AppLayout({ pageTitle = "Dashboard" }: AppLayoutProps) {
  const { user, roles, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.name ?? user?.preferredUsername ?? "User";
  const displayRole = roles.length > 0 ? roles[0].replace(/_/g, " ") : "User";

  return (
    <div className={styles.layout}>
      <Sidebar
        roles={roles}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.main}>
        <TopBar
          pageTitle={pageTitle}
          userName={displayName}
          userRole={displayRole}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onLogout={logout}
        />
        <div className={styles.content}>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
