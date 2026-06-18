import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";
import { ROLES, filterAppRoles, getRoleLabel } from "../auth/roles";
import { Card, Button } from "../components/ui";
import { PageHeader, StatCard } from "../components/patterns";
import {
  Calendar,
  FileText,
  ClipboardCheck,
  Stethoscope,
  Clock,
  Building2,
  Users,
} from "lucide-react";
import { listAppointments } from "../api/appointments";
import { getDashboard } from "../api/admin";
import { STALE_TIMES } from "../config/queryConfig";
import styles from "./DashboardPage.module.css";

function ClinicDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: () => listAppointments(0, 5),
    staleTime: STALE_TIMES.dashboard,
  });

  const upcomingCount = appointmentsData?.totalElements ?? 0;

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Calendar size={20} />}
          value={upcomingCount}
          label={t("clinic.upcomingAppointments")}
          isLoading={isLoading}
          href="/appointments"
        />
        <StatCard
          icon={<FileText size={20} />}
          value="--"
          label={t("clinic.pendingReports")}
          href="/reports"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value="--"
          label={t("clinic.activeExamRequests")}
          href="/exam-requests"
        />
      </div>

      <div className={styles.quickActions}>
        <Button onClick={() => navigate("/exam-requests/new")}>
          {t("clinic.newExamRequest")}
        </Button>
        <Button variant="secondary" onClick={() => navigate("/appointments")}>
          {t("clinic.viewSchedule")}
        </Button>
      </div>

      <Card title={t("clinic.recentActivity")}>
        <p className={styles.emptyText}>
          {t("clinic.emptyActivity")}
        </p>
      </Card>
    </>
  );
}

function SpecialistDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", "specialist", "today"],
    queryFn: () => listAppointments(0, 10, "SCHEDULED"),
    staleTime: STALE_TIMES.dashboard,
  });

  const todayCount = appointmentsData?.totalElements ?? 0;

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Stethoscope size={20} />}
          value={todayCount}
          label={t("specialist.todaysAppointments")}
          isLoading={isLoading}
          href="/appointments"
        />
        <StatCard
          icon={<Clock size={20} />}
          value="--"
          label={t("specialist.pendingRequests")}
          href="/exam-requests"
        />
        <StatCard
          icon={<FileText size={20} />}
          value="--"
          label={t("specialist.reportsToIssue")}
          href="/reports"
        />
      </div>

      <div className={styles.quickActions}>
        <Button onClick={() => navigate("/schedule")}>{t("specialist.viewSchedule")}</Button>
      </div>

      <Card title={t("specialist.recentActivity")}>
        <p className={styles.emptyText}>
          {t("specialist.emptyActivity")}
        </p>
      </Card>
    </>
  );
}

function AdminDashboard() {
  const { t } = useTranslation("dashboard");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
    staleTime: STALE_TIMES.dashboard,
  });

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={20} />}
          value={dashboardData?.totalClinics ?? 0}
          label={t("admin.totalClinics")}
          isLoading={isLoading}
          href="/clinics"
        />
        <StatCard
          icon={<Users size={20} />}
          value={dashboardData?.totalSpecialists ?? 0}
          label={t("admin.totalSpecialists")}
          isLoading={isLoading}
          href="/specialists"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={
            (dashboardData?.pendingClinicApprovals ?? 0) +
            (dashboardData?.pendingSpecialistApprovals ?? 0)
          }
          label={t("admin.pendingApprovals")}
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={dashboardData?.totalActiveAppointments ?? 0}
          label={t("admin.activeAppointments")}
          isLoading={isLoading}
          href="/appointments"
        />
      </div>

      <Card title={t("admin.platformOverview")}>
        <p className={styles.emptyText}>
          {t("admin.emptyOverview")}
        </p>
      </Card>
    </>
  );
}

export function DashboardPage() {
  const { user, roles } = useAuth();
  const { t } = useTranslation("dashboard");

  const displayName = user?.name ?? user?.preferredUsername ?? "User";
  const appRoles = filterAppRoles(roles);
  const displayRole =
    appRoles.length > 0 ? getRoleLabel(appRoles[0]) : "User";

  const isAdmin =
    roles.includes(ROLES.PLATFORM_ADMIN) ||
    roles.includes(ROLES.PLATFORM_OPERATOR);
  const isSpecialist = roles.includes(ROLES.SPECIALIST);

  return (
    <div>
      <PageHeader
        title={t("welcome", { name: displayName })}
        subtitle={displayRole}
      />

      {isAdmin && <AdminDashboard />}
      {!isAdmin && isSpecialist && <SpecialistDashboard />}
      {!isAdmin && !isSpecialist && <ClinicDashboard />}
    </div>
  );
}
