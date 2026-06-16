import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDashboard } from "../../api/admin";
import { Button } from "../../components/ui";
import { PageHeader, StatCard } from "../../components/patterns";
import {
  Building2,
  Users,
  ClipboardCheck,
  Calendar,
  Activity,
} from "lucide-react";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  const { t } = useTranslation("dashboard");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  return (
    <div>
      <PageHeader title={t("admin.title")} />

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={20} />}
          value={data?.totalClinics ?? 0}
          label={t("admin.totalClinics")}
          isLoading={isLoading}
          href="/clinics"
        />
        <StatCard
          icon={<Users size={20} />}
          value={data?.totalSpecialists ?? 0}
          label={t("admin.totalSpecialists")}
          isLoading={isLoading}
          href="/specialists"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingClinicApprovals ?? 0}
          label={t("admin.pendingClinicApprovals")}
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingSpecialistApprovals ?? 0}
          label={t("admin.pendingSpecialistApprovals")}
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={data?.totalAppointmentsToday ?? 0}
          label={t("admin.appointmentsToday")}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Activity size={20} />}
          value={data?.totalActiveAppointments ?? 0}
          label={t("admin.activeAppointments")}
          isLoading={isLoading}
          href="/appointments"
        />
      </div>

      <div className={styles.quickLinks}>
        <Link to="/admin/approvals" className={styles.quickLink}>
          <Button variant="secondary">{t("admin.viewApprovals")}</Button>
        </Link>
        <Link to="/clinics" className={styles.quickLink}>
          <Button variant="secondary">{t("admin.viewClinics")}</Button>
        </Link>
        <Link to="/specialists" className={styles.quickLink}>
          <Button variant="secondary">{t("admin.viewSpecialists")}</Button>
        </Link>
      </div>
    </div>
  );
}
