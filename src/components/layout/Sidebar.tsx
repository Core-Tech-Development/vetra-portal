import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  Users,
  UserCog,
  Calendar,
  Clock,
  FileText,
  ClipboardList,
  Stethoscope,
  Building2,
  Shield,
  CheckCircle,
  ScrollText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { UserRole } from "../../auth/roles";
import { ROLES } from "../../auth/roles";
import { Avatar } from "../ui/Avatar";
import { Tooltip } from "../ui/Tooltip";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
}

const CLINIC_NAV: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Patients", path: "/patients", icon: PawPrint },
  { label: "Tutors", path: "/tutors", icon: Users },
  { label: "Exam requests", path: "/exam-requests", icon: ClipboardList },
  { label: "Appointments", path: "/appointments", icon: Calendar },
  { label: "Laudos", path: "/laudos", icon: FileText },
];

const SPECIALIST_NAV: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Schedule", path: "/schedule", icon: Clock },
  { label: "Appointments", path: "/appointments", icon: Calendar },
  { label: "Laudos", path: "/laudos", icon: FileText },
  { label: "Profile", path: "/profile", icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Admin", path: "/admin", icon: Shield },
  { label: "Approvals", path: "/admin/approvals", icon: CheckCircle },
  { label: "Clinics", path: "/clinics", icon: Building2 },
  { label: "Specialists", path: "/specialists", icon: Stethoscope },
  { label: "Appointments", path: "/appointments", icon: Calendar },
  { label: "Laudos", path: "/laudos", icon: FileText },
  { label: "Audit log", path: "/admin/audit", icon: ScrollText },
];

function getNavItems(roles: UserRole[]): NavItem[] {
  if (roles.includes(ROLES.PLATFORM_ADMIN) || roles.includes(ROLES.PLATFORM_OPERATOR)) {
    return ADMIN_NAV;
  }
  if (roles.includes(ROLES.SPECIALIST)) {
    return SPECIALIST_NAV;
  }
  const items = [...CLINIC_NAV];
  if (roles.includes(ROLES.CLINIC_ADMIN)) {
    items.splice(1, 0, { label: "Staff", path: "/staff", icon: UserCog });
  }
  return items;
}

interface SidebarProps {
  roles: UserRole[];
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export function Sidebar({
  roles,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
  userName,
  userRole,
  onLogout,
}: SidebarProps) {
  const location = useLocation();
  const navItems = getNavItems(roles);

  const sidebarClassNames = [
    styles.sidebar,
    isOpen ? styles.sidebarOpen : "",
    collapsed ? styles.sidebarCollapsed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          role="presentation"
        />
      )}
      <aside className={sidebarClassNames} aria-label="Main navigation">
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="" className={styles.logoImg} />
            {!collapsed && <span className={styles.logoText}>Vetra</span>}
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close navigation menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            const linkClassNames = [
              styles.navItem,
              isActive ? styles.navItemActive : "",
            ]
              .filter(Boolean)
              .join(" ");

            const linkContent = (
              <Link
                key={item.path}
                to={item.path}
                className={linkClassNames}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path} content={item.label} position="right">
                  {linkContent}
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userSection}>
            {collapsed ? (
              <Tooltip content={userName} position="right">
                <button
                  className={styles.userButton}
                  type="button"
                  aria-label={`${userName} - ${userRole}`}
                >
                  <Avatar name={userName} size="sm" />
                </button>
              </Tooltip>
            ) : (
              <div className={styles.userInfo}>
                <Avatar name={userName} size="sm" />
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{userName}</span>
                  <span className={styles.userRoleLabel}>{userRole}</span>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              className={styles.logoutButton}
              onClick={onLogout}
              type="button"
              aria-label="Sign out"
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          )}

          {collapsed && (
            <Tooltip content="Sign out" position="right">
              <button
                className={styles.logoutButtonCollapsed}
                onClick={onLogout}
                type="button"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </Tooltip>
          )}

          <button
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
