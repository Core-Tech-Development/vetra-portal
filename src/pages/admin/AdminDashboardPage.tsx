import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  return (
    <div>
      <PageHeader title="Admin Dashboard" />

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={20} />}
          value={data?.totalClinics ?? 0}
          label="Total clinics"
          isLoading={isLoading}
          href="/clinics"
        />
        <StatCard
          icon={<Users size={20} />}
          value={data?.totalSpecialists ?? 0}
          label="Total specialists"
          isLoading={isLoading}
          href="/specialists"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingClinicApprovals ?? 0}
          label="Pending clinic approvals"
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingSpecialistApprovals ?? 0}
          label="Pending specialist approvals"
          isLoading={isLoading}
          href="/admin/approvals"
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={data?.totalAppointmentsToday ?? 0}
          label="Appointments today"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Activity size={20} />}
          value={data?.totalActiveAppointments ?? 0}
          label="Active appointments"
          isLoading={isLoading}
          href="/appointments"
        />
      </div>

      <div className={styles.quickLinks}>
        <Link to="/admin/approvals" className={styles.quickLink}>
          <Button variant="secondary">View approvals</Button>
        </Link>
        <Link to="/clinics" className={styles.quickLink}>
          <Button variant="secondary">View clinics</Button>
        </Link>
        <Link to="/specialists" className={styles.quickLink}>
          <Button variant="secondary">View specialists</Button>
        </Link>
      </div>
    </div>
  );
}
