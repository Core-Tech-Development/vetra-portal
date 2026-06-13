import { Menu, Bell, LogOut, User } from "lucide-react";
import { Breadcrumb } from "../ui/Breadcrumb";
import { Avatar } from "../ui/Avatar";
import { DropdownMenu } from "../ui/DropdownMenu";
import styles from "./TopBar.module.css";

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
  userName: string;
  userRole: string;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export function TopBar({
  breadcrumbs,
  userName,
  onMenuToggle,
  onLogout,
}: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          className={`${styles.iconButton} ${styles.menuButton}`}
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <div className={styles.rightSection}>
        <button
          className={styles.iconButton}
          aria-label="Notifications"
          type="button"
        >
          <Bell size={20} />
        </button>
        <DropdownMenu
          trigger={<Avatar name={userName} size="sm" />}
          items={[
            {
              label: userName,
              icon: <User size={16} />,
              onClick: () => {},
            },
            {
              label: "Sign out",
              icon: <LogOut size={16} />,
              onClick: onLogout,
              variant: "danger",
            },
          ]}
          align="end"
        />
      </div>
    </header>
  );
}
