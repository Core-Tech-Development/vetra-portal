import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { t } = useTranslation("auth");

  return (
    <div className={styles.page}>
      <div className={styles.icon}>
        <FileQuestion size={64} aria-hidden="true" />
      </div>
      <h2 className={styles.title}>{t("notFound.title")}</h2>
      <p className={styles.description}>{t("notFound.description")}</p>
      <Link to="/">
        <Button>
          <Home size={16} aria-hidden="true" />
          {t("notFound.goToDashboard")}
        </Button>
      </Link>
    </div>
  );
}
