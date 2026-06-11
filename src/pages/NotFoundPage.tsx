import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h2 className={styles.title}>Page not found</h2>
      <p className={styles.description}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
