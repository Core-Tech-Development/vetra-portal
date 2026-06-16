import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listClinics } from "../../api/clinics";
import { listSpecialists, approveSpecialist } from "../../api/specialists";
import { approveClinic } from "../../api/admin";
import { Button, Tabs, TabList, Tab, TabPanel } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { ClinicResponse, SpecialistResponse } from "../../api/types";
import styles from "./AdminApprovalsPage.module.css";

export function AdminApprovalsPage() {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState("clinics");
  const [clinicPage, setClinicPage] = useState(0);
  const [specialistPage, setSpecialistPage] = useState(0);
  const [clinicSearch, setClinicSearch] = useState("");
  const [specialistSearch, setSpecialistSearch] = useState("");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: clinicsData, isLoading: clinicsLoading, isError: clinicsError, refetch: refetchClinics } = useQuery({
    queryKey: ["clinics", 0],
    queryFn: () => listClinics(0, 100),
  });

  const { data: specialistsData, isLoading: specialistsLoading, isError: specialistsError, refetch: refetchSpecialists } = useQuery({
    queryKey: ["specialists", 0],
    queryFn: () => listSpecialists(0, 100),
  });

  const pendingClinics =
    clinicsData?.content.filter((c) => c.status === "PENDING_APPROVAL") ?? [];
  const pendingSpecialists =
    specialistsData?.content.filter((s) => s.status === "PENDING_APPROVAL") ??
    [];

  const approveCMutation = useMutation({
    mutationFn: (id: string) => approveClinic(id),
    onSuccess: () => {
      showToast(t('approvals.clinicApproved'), "success");
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast(t('approvals.clinicApproveFailed'), "error");
    },
  });

  const approveSMutation = useMutation({
    mutationFn: (id: string) => approveSpecialist(id),
    onSuccess: () => {
      showToast(t('approvals.specialistApproved'), "success");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => {
      showToast(t('approvals.specialistApproveFailed'), "error");
    },
  });

  const clinicColumns: TableColumn<ClinicResponse>[] = [
    {
      key: "name",
      header: t('approvals.columns.name'),
      render: (row) => <span className={styles.approvalName}>{row.name}</span>,
    },
    {
      key: "document",
      header: t('approvals.columns.document'),
      render: (row) => row.document,
    },
    {
      key: "location",
      header: t('approvals.columns.location'),
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
            {t('approvals.approveButton')}
          </Button>
        </div>
      ),
    },
  ];

  const specialistColumns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: t('approvals.columns.name'),
      render: (row) => <span className={styles.approvalName}>{row.name}</span>,
    },
    {
      key: "crmv",
      header: t('approvals.columns.crmv'),
      render: (row) => `${row.crmv}/${row.crmvState}`,
    },
    {
      key: "specialty",
      header: t('approvals.columns.specialty'),
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
            {t('approvals.approveButton')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('approvals.title')} />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="clinics">{t('approvals.clinicApprovalsTab', { count: pendingClinics.length })}</Tab>
          <Tab value="specialists">{t('approvals.specialistApprovalsTab', { count: pendingSpecialists.length })}</Tab>
        </TabList>

        <TabPanel value="clinics" activeValue={activeTab}>
          <DataTableLayout
            columns={clinicColumns}
            data={pendingClinics}
            keyExtractor={(row) => row.id}
            isLoading={clinicsLoading}
            isError={clinicsError}
            errorMessage={t('approvals.errorClinic')}
            onRetry={() => refetchClinics()}
            emptyState={{
              title: t('approvals.emptyClinic.title'),
              description: t('approvals.emptyClinic.description'),
            }}
            page={clinicPage}
            totalPages={1}
            onPageChange={setClinicPage}
            searchValue={clinicSearch}
            onSearchChange={setClinicSearch}
            searchPlaceholder={t('approvals.searchClinics')}
          />
        </TabPanel>

        <TabPanel value="specialists" activeValue={activeTab}>
          <DataTableLayout
            columns={specialistColumns}
            data={pendingSpecialists}
            keyExtractor={(row) => row.id}
            isLoading={specialistsLoading}
            isError={specialistsError}
            errorMessage={t('approvals.errorSpecialist')}
            onRetry={() => refetchSpecialists()}
            emptyState={{
              title: t('approvals.emptySpecialist.title'),
              description: t('approvals.emptySpecialist.description'),
            }}
            page={specialistPage}
            totalPages={1}
            onPageChange={setSpecialistPage}
            searchValue={specialistSearch}
            onSearchChange={setSpecialistSearch}
            searchPlaceholder={t('approvals.searchSpecialists')}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}
