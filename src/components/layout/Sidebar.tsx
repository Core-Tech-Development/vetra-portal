import { Link, useLocation } from "react-router-dom";
import type { UserRole } from "../../auth/roles";
import { ROLES } from "../../auth/roles";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  path: string;
}

const CLINIC_NAV: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Patients", path: "/patients" },
  { label: "Tutors", path: "/tutors" },
  { label: "Exam requests", path: "/exam-requests" },
  { label: "Appointments", path: "/appointments" },
  { label: "Laudos", path: "/laudos" },
];

const SPECIALIST_NAV: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Appointments", path: "/appointments" },
  { label: "Laudos", path: "/laudos" },
  { label: "Profile", path: "/profile" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Admin", path: "/admin" },
  { label: "Approvals", path: "/admin/approvals" },
  { label: "Clinics", path: "/clinics" },
  { label: "Specialists", path: "/specialists" },
  { label: "Appointments", path: "/appointments" },
  { label: "Laudos", path: "/laudos" },
  { label: "Audit log", path: "/admin/audit" },
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
    items.splice(1, 0, { label: "Staff", path: "/staff" });
  }
  return items;
}

interface SidebarProps {
  roles: UserRole[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ roles, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const navItems = getNavItems(roles);

  const sidebarClassNames = [
    styles.sidebar,
    isOpen ? styles.sidebarOpen : "",
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
        <div className={styles.logo}>
          <img src="/logo.png" alt="" className={styles.logoImg} />
          <span className={styles.logoText}>Vetra</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (
              item.path !== "/" && location.pathname.startsWith(item.path)
            );
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
