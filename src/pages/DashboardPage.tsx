import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import { Card, Button, Spinner } from "../components/ui";
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
      <div className={styles.grid}>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? <Spinner size="sm" /> : upcomingCount}
          </div>
          <div className={styles.statLabel}>Upcoming appointments</div>
        </Card>
        <Card>
          <div className={styles.statValue}>--</div>
          <div className={styles.statLabel}>Pending reports</div>
        </Card>
        <Card>
          <div className={styles.statValue}>--</div>
          <div className={styles.statLabel}>Active exam requests</div>
        </Card>
      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate("/exam-requests/new")}>
          New exam request
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
      <div className={styles.grid}>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? <Spinner size="sm" /> : todayCount}
          </div>
          <div className={styles.statLabel}>Today's appointments</div>
        </Card>
        <Card>
          <div className={styles.statValue}>--</div>
          <div className={styles.statLabel}>Pending requests</div>
        </Card>
        <Card>
          <div className={styles.statValue}>--</div>
          <div className={styles.statLabel}>Reports to issue</div>
        </Card>
      </div>

      <div className={styles.actions}>
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
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
  });

  return (
    <>
      <div className={styles.grid}>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              dashboardData?.totalClinics ?? 0
            )}
          </div>
          <div className={styles.statLabel}>Total clinics</div>
        </Card>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              dashboardData?.totalSpecialists ?? 0
            )}
          </div>
          <div className={styles.statLabel}>Total specialists</div>
        </Card>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              (dashboardData?.pendingClinicApprovals ?? 0) +
              (dashboardData?.pendingSpecialistApprovals ?? 0)
            )}
          </div>
          <div className={styles.statLabel}>Pending approvals</div>
        </Card>
        <Card>
          <div className={styles.statValue}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              dashboardData?.totalActiveAppointments ?? 0
            )}
          </div>
          <div className={styles.statLabel}>Active appointments</div>
        </Card>
      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate("/admin/approvals")}>
          View approvals
        </Button>
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
  const displayRole = roles.length > 0 ? roles[0].replace(/_/g, " ") : "User";

  const isAdmin =
    roles.includes(ROLES.PLATFORM_ADMIN) ||
    roles.includes(ROLES.PLATFORM_OPERATOR);
  const isSpecialist = roles.includes(ROLES.SPECIALIST);

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.welcome}>Welcome, {displayName}</h2>
        <p className={styles.subtitle}>Role: {displayRole}</p>
      </div>

      {isAdmin && <AdminDashboard />}
      {!isAdmin && isSpecialist && <SpecialistDashboard />}
      {!isAdmin && !isSpecialist && <ClinicDashboard />}
    </div>
  );
}
