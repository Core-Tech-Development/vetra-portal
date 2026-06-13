import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { filterAppRoles, getRoleLabel } from "../../auth/roles";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageContainer } from "./PageContainer";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { user, roles, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("vetra_sidebar_collapsed") === "true";
  });

  const breadcrumbs = useBreadcrumbs();

  const displayName = user?.name ?? user?.preferredUsername ?? "User";
  const appRoles = filterAppRoles(roles);
  const displayRole = appRoles.length > 0 ? getRoleLabel(appRoles[0]) : "Usuário";

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem("vetra_sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <div className={styles.layout}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar
        roles={roles}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        userName={displayName}
        userRole={displayRole}
        onLogout={logout}
      />
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ""}`}>
        <TopBar
          breadcrumbs={breadcrumbs}
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
