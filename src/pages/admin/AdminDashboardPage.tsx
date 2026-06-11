import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api/admin";
import { Card, Spinner, Button } from "../../components/ui";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Admin dashboard</h2>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{data?.totalClinics ?? 0}</div>
            <div className={styles.statLabel}>Total clinics</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {data?.totalSpecialists ?? 0}
            </div>
            <div className={styles.statLabel}>Total specialists</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {data?.pendingClinicApprovals ?? 0}
            </div>
            <div className={styles.statLabel}>Pending clinic approvals</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {data?.pendingSpecialistApprovals ?? 0}
            </div>
            <div className={styles.statLabel}>
              Pending specialist approvals
            </div>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {data?.totalAppointmentsToday ?? 0}
            </div>
            <div className={styles.statLabel}>Appointments today</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {data?.totalActiveAppointments ?? 0}
            </div>
            <div className={styles.statLabel}>Active appointments</div>
          </div>
        </Card>
      </div>

      <div className={styles.quickLinks}>
        <Link to="/admin/approvals">
          <Button variant="secondary">View approvals</Button>
        </Link>
        <Link to="/clinics">
          <Button variant="secondary">View clinics</Button>
        </Link>
        <Link to="/specialists">
          <Button variant="secondary">View specialists</Button>
        </Link>
      </div>
    </div>
  );
}
