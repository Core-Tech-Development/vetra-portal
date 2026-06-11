import styles from "./TopBar.module.css";

interface TopBarProps {
  pageTitle: string;
  userName: string;
  userRole: string;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export function TopBar({
  pageTitle,
  userName,
  userRole,
  onMenuToggle,
  onLogout,
}: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          &#9776;
        </button>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{userRole}</span>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
