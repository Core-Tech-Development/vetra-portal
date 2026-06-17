import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ChangePasswordForm } from "../../components/profile/ChangePasswordForm";
import styles from "./AdminProfilePage.module.css";

export function AdminProfilePage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={t("profile.title")} />

      <DetailSection title={t("profile.myData")} columns={2}>
        <FieldDisplay
          label={t("profile.name")}
          value={user?.name ?? "-"}
        />
        <FieldDisplay
          label={t("profile.email")}
          value={user?.email ?? "-"}
        />
        <FieldDisplay
          label={t("profile.username")}
          value={user?.preferredUsername ?? "-"}
        />
      </DetailSection>

      <div className={styles.section}>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
