import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "../ui/Breadcrumb";
import { Avatar } from "../ui/Avatar";
import { DropdownMenu } from "../ui/DropdownMenu";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { getUnreadCount } from "../../api/notifications";
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
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const handleClose = useCallback(() => {
    setPanelOpen(false);
  }, []);

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
        <div className={styles.bellWrapper} ref={bellRef}>
          <button
            className={styles.iconButton}
            onClick={() => setPanelOpen(!panelOpen)}
            aria-label={t("topbar.notifications")}
            type="button"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {panelOpen && <NotificationPanel onClose={handleClose} />}
        </div>
        <DropdownMenu
          trigger={<Avatar name={userName} size="sm" />}
          items={[
            {
              label: t("topbar.myProfile"),
              icon: <User size={16} />,
              onClick: () => navigate("/profile"),
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
