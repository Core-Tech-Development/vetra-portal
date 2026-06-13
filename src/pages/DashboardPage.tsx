import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import styles from "./DashboardPage.module.css";

function ClinicDashboard() {
  const navigate = useNavigate();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: () => listAppointments(0, 5),
  });

  const upcomingCount = appointmentsData?.totalElements ?? 0;

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Calendar size={20} />}
          value={upcomingCount}
          label="Upcoming appointments"
          isLoading={isLoading}
          href="/appointments"
        />
        <StatCard
          icon={<FileText size={20} />}
          value="--"
          label="Pending reports"
          href="/reports"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value="--"
          label="Active exam requests"
          href="/exam-requests"
        />
      </div>

      <div className={styles.quickActions}>
        <Button onClick={() => navigate("/exam-requests/new")}>
          New exam request
        </Button>
        <Button variant="secondary" onClick={() => navigate("/appointments")}>
          View schedule
        </Button>
      </div>

      <Card title="Recent activity">
        <p className={styles.emptyText}>
          No recent activity to display. Start by creating an exam request or
          registering a new tutor.
        </p>
      </Card>
    </>
  );
}

function SpecialistDashboard() {
  const navigate = useNavigate();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", "specialist", "today"],
    queryFn: () => listAppointments(0, 10, "SCHEDULED"),
  });

  const todayCount = appointmentsData?.totalElements ?? 0;

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Stethoscope size={20} />}
          value={todayCount}
          label="Today's appointments"
          isLoading={isLoading}
          href="/appointments"
        />
        <StatCard
          icon={<Clock size={20} />}
          value="--"
          label="Pending requests"
          href="/exam-requests"
        />
        <StatCard
          icon={<FileText size={20} />}
          value="--"
          label="Reports to issue"
          href="/reports"
        />
      </div>

      <div className={styles.quickActions}>
        <Button onClick={() => navigate("/schedule")}>View schedule</Button>
      </div>

      <Card title="Recent activity">
        <p className={styles.emptyText}>
          No recent activity to display. Check your schedule for upcoming
          appointments.
        </p>
      </Card>
    </>
  );
}

function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
  });

  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={20} />}
          value={dashboardData?.totalClinics ?? 0}
          label="Total clinics"
          isLoading={isLoading}
          href="/clinics"
        />
        <StatCard
          icon={<Users size={20} />}
          value={dashboardData?.totalSpecialists ?? 0}
          label="Total specialists"
          isLoading={isLoading}
          href="/specialists"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={
            (dashboardData?.pendingClinicApprovals ?? 0) +
            (dashboardData?.pendingSpecialistApprovals ?? 0)
          }
          label="Pending approvals"
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={dashboardData?.totalActiveAppointments ?? 0}
          label="Active appointments"
          isLoading={isLoading}
          href="/appointments"
        />
      </div>

      <Card title="Platform overview">
        <p className={styles.emptyText}>
          Monitor platform activity, manage approvals, and review audit logs
          from the admin panel.
        </p>
      </Card>
    </>
  );
}

export function DashboardPage() {
  const { user, roles } = useAuth();

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
        title={`Welcome, ${displayName}`}
        subtitle={displayRole}
      />

      {isAdmin && <AdminDashboard />}
      {!isAdmin && isSpecialist && <SpecialistDashboard />}
      {!isAdmin && !isSpecialist && <ClinicDashboard />}
    </div>
  );
}
