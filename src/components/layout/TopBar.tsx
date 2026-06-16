import { Menu, Bell, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "../ui/Breadcrumb";
import { Avatar } from "../ui/Avatar";
import { DropdownMenu } from "../ui/DropdownMenu";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
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
  const { t } = useTranslation("common");

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          className={`${styles.iconButton} ${styles.menuButton}`}
          onClick={onMenuToggle}
          aria-label={t("topbar.toggleMenu")}
        >
          <Menu size={20} />
        </button>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <div className={styles.rightSection}>
        <LanguageSwitcher />
        <button
          className={styles.iconButton}
          aria-label={t("topbar.notifications")}
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
              label: t("actions.signOut"),
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
