import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "../components/ui";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.icon}>
        <FileQuestion size={64} aria-hidden="true" />
      </div>
      <h2 className={styles.title}>Page not found</h2>
      <p className={styles.description}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button>
          <Home size={16} aria-hidden="true" />
          Go to dashboard
        </Button>
      </Link>
    </div>
  );
}
