import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getDashboard, approveClinic } from "../../api/admin";
import { listClinics } from "../../api/clinics";
import { listSpecialists, approveSpecialist } from "../../api/specialists";
import { Button, Tabs, TabList, Tab, TabPanel } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, StatCard, DataTableLayout } from "../../components/patterns";
import type { ClinicResponse, SpecialistResponse } from "../../api/types";
import {
  Building2,
  Users,
  ClipboardCheck,
  Calendar,
  Activity,
} from "lucide-react";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardPage() {
  const { t } = useTranslation(["dashboard", "admin"]);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("clinics");
  const [clinicPage, setClinicPage] = useState(0);
  const [specialistPage, setSpecialistPage] = useState(0);
  const [clinicSearch, setClinicSearch] = useState("");
  const [specialistSearch, setSpecialistSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  const {
    data: clinicsData,
    isLoading: clinicsLoading,
    isError: clinicsError,
    refetch: refetchClinics,
  } = useQuery({
    queryKey: ["clinics", 0],
    queryFn: () => listClinics(0, 100),
  });

  const {
    data: specialistsData,
    isLoading: specialistsLoading,
    isError: specialistsError,
    refetch: refetchSpecialists,
  } = useQuery({
    queryKey: ["specialists", 0],
    queryFn: () => listSpecialists(0, 100),
  });

  const pendingClinics =
    clinicsData?.content.filter((c) => c.status === "PENDING_APPROVAL") ?? [];
  const pendingSpecialists =
    specialistsData?.content.filter((s) => s.status === "PENDING_APPROVAL") ??
    [];

  const hasPendingItems =
    pendingClinics.length > 0 || pendingSpecialists.length > 0;

  const approveCMutation = useMutation({
    mutationFn: (id: string) => approveClinic(id),
    onSuccess: () => {
      showToast(t("admin:approvals.clinicApproved"), "success");
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast(t("admin:approvals.clinicApproveFailed"), "error");
    },
  });

  const approveSMutation = useMutation({
    mutationFn: (id: string) => approveSpecialist(id),
    onSuccess: () => {
      showToast(t("admin:approvals.specialistApproved"), "success");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast(t("admin:approvals.specialistApproveFailed"), "error");
    },
  });

  const clinicColumns: TableColumn<ClinicResponse>[] = [
    {
      key: "name",
      header: t("admin:approvals.columns.name"),
      render: (row) => (
        <span className={styles.approvalName}>{row.name}</span>
      ),
    },
    {
      key: "document",
      header: t("admin:approvals.columns.document"),
      render: (row) => row.document,
    },
    {
      key: "location",
      header: t("admin:approvals.columns.location"),
      render: (row) => `${row.city}, ${row.state}`,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Button
            size="sm"
            onClick={() => approveCMutation.mutate(row.id)}
            isLoading={
              approveCMutation.isPending &&
              approveCMutation.variables === row.id
            }
            disabled={approveCMutation.isPending}
          >
            {t("admin:approvals.approveButton")}
          </Button>
        </div>
      ),
    },
  ];

  const specialistColumns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: t("admin:approvals.columns.name"),
      render: (row) => (
        <span className={styles.approvalName}>{row.name}</span>
      ),
    },
    {
      key: "crmv",
      header: t("admin:approvals.columns.crmv"),
      render: (row) => `${row.crmv}/${row.crmvState}`,
    },
    {
      key: "specialty",
      header: t("admin:approvals.columns.specialty"),
      render: (row) => row.specialty,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className={styles.tableActions}>
          <Button
            size="sm"
            onClick={() => approveSMutation.mutate(row.id)}
            isLoading={
              approveSMutation.isPending &&
              approveSMutation.variables === row.id
            }
            disabled={approveSMutation.isPending}
          >
            {t("admin:approvals.approveButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("dashboard:admin.title")} />

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={20} />}
          value={data?.totalClinics ?? 0}
          label={t("dashboard:admin.totalClinics")}
          isLoading={isLoading}
          href="/clinics"
        />
        <StatCard
          icon={<Users size={20} />}
          value={data?.totalSpecialists ?? 0}
          label={t("dashboard:admin.totalSpecialists")}
          isLoading={isLoading}
          href="/specialists"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingClinicApprovals ?? 0}
          label={t("dashboard:admin.pendingClinicApprovals")}
          isLoading={isLoading}
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          value={data?.pendingSpecialistApprovals ?? 0}
          label={t("dashboard:admin.pendingSpecialistApprovals")}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={data?.totalAppointmentsToday ?? 0}
          label={t("dashboard:admin.appointmentsToday")}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Activity size={20} />}
          value={data?.totalActiveAppointments ?? 0}
          label={t("dashboard:admin.activeAppointments")}
          isLoading={isLoading}
          href="/appointments"
        />
      </div>

      {hasPendingItems && (
        <div className={styles.approvalsSection}>
          <h2 className={styles.approvalsSectionTitle}>
            {t("admin:approvals.title")}
          </h2>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab value="clinics">
                {t("admin:approvals.clinicApprovalsTab", {
                  count: pendingClinics.length,
                })}
              </Tab>
              <Tab value="specialists">
                {t("admin:approvals.specialistApprovalsTab", {
                  count: pendingSpecialists.length,
                })}
              </Tab>
            </TabList>

            <TabPanel value="clinics" activeValue={activeTab}>
              <DataTableLayout
                columns={clinicColumns}
                data={pendingClinics}
                keyExtractor={(row) => row.id}
                isLoading={clinicsLoading}
                isError={clinicsError}
                errorMessage={t("admin:approvals.errorClinic")}
                onRetry={() => refetchClinics()}
                emptyState={{
                  title: t("admin:approvals.emptyClinic.title"),
                  description: t("admin:approvals.emptyClinic.description"),
                }}
                page={clinicPage}
                totalPages={1}
                onPageChange={setClinicPage}
                searchValue={clinicSearch}
                onSearchChange={setClinicSearch}
                searchPlaceholder={t("admin:approvals.searchClinics")}
              />
            </TabPanel>

            <TabPanel value="specialists" activeValue={activeTab}>
              <DataTableLayout
                columns={specialistColumns}
                data={pendingSpecialists}
                keyExtractor={(row) => row.id}
                isLoading={specialistsLoading}
                isError={specialistsError}
                errorMessage={t("admin:approvals.errorSpecialist")}
                onRetry={() => refetchSpecialists()}
                emptyState={{
                  title: t("admin:approvals.emptySpecialist.title"),
                  description: t(
                    "admin:approvals.emptySpecialist.description"
                  ),
                }}
                page={specialistPage}
                totalPages={1}
                onPageChange={setSpecialistPage}
                searchValue={specialistSearch}
                onSearchChange={setSpecialistSearch}
                searchPlaceholder={t("admin:approvals.searchSpecialists")}
              />
            </TabPanel>
          </Tabs>
        </div>
      )}
    </div>
  );
}
