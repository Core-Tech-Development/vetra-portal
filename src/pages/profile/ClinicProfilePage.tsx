import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyClinicProfile, updateMyClinicProfile } from "../../api/clinics";
import { getMyStaffProfile, updateMyStaffProfile } from "../../api/clinicStaff";
import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  StatusBadge,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ChangePasswordForm } from "../../components/profile/ChangePasswordForm";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../i18n/formatting";
import styles from "./ClinicProfilePage.module.css";

const BRAZILIAN_STATES = [
  { value: "AC", label: "AC" },
  { value: "AL", label: "AL" },
  { value: "AP", label: "AP" },
  { value: "AM", label: "AM" },
  { value: "BA", label: "BA" },
  { value: "CE", label: "CE" },
  { value: "DF", label: "DF" },
  { value: "ES", label: "ES" },
  { value: "GO", label: "GO" },
  { value: "MA", label: "MA" },
  { value: "MT", label: "MT" },
  { value: "MS", label: "MS" },
  { value: "MG", label: "MG" },
  { value: "PA", label: "PA" },
  { value: "PB", label: "PB" },
  { value: "PR", label: "PR" },
  { value: "PE", label: "PE" },
  { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" },
  { value: "RN", label: "RN" },
  { value: "RS", label: "RS" },
  { value: "RO", label: "RO" },
  { value: "RR", label: "RR" },
  { value: "SC", label: "SC" },
  { value: "SP", label: "SP" },
  { value: "SE", label: "SE" },
  { value: "TO", label: "TO" },
];

interface ClinicDataForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

interface StaffDataForm {
  name: string;
  phone: string;
}

export function ClinicProfilePage() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { roles } = useAuth();

  const isClinicAdmin = roles.includes("CLINIC_ADMIN");

  const {
    data: clinicProfile,
    isLoading: clinicLoading,
    isError: clinicError,
    refetch: refetchClinic,
  } = useQuery({
    queryKey: ["my-clinic-profile"],
    queryFn: getMyClinicProfile,
  });

  const {
    data: staffProfile,
    isLoading: staffLoading,
    isError: staffError,
    refetch: refetchStaff,
  } = useQuery({
    queryKey: ["my-staff-profile"],
    queryFn: getMyStaffProfile,
  });

  const clinicForm = useForm<ClinicDataForm>();
  const staffForm = useForm<StaffDataForm>();

  useEffect(() => {
    if (clinicProfile && isClinicAdmin) {
      clinicForm.reset({
        name: clinicProfile.name,
        phone: clinicProfile.phone ?? "",
        address: clinicProfile.address ?? "",
        city: clinicProfile.city ?? "",
        state: clinicProfile.state ?? "",
      });
    }
  }, [clinicProfile, isClinicAdmin, clinicForm.reset]);

  useEffect(() => {
    if (staffProfile) {
      staffForm.reset({
        name: staffProfile.name,
        phone: staffProfile.phone ?? "",
      });
    }
  }, [staffProfile, staffForm.reset]);

  const updateClinicMutation = useMutation({
    mutationFn: updateMyClinicProfile,
    onSuccess: () => {
      showToast(t("profile.toast.clinicUpdated"), "success");
      queryClient.invalidateQueries({ queryKey: ["my-clinic-profile"] });
    },
    onError: () => {
      showToast(t("profile.toast.clinicUpdateFailed"), "error");
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: updateMyStaffProfile,
    onSuccess: () => {
      showToast(t("profile.toast.staffUpdated"), "success");
      queryClient.invalidateQueries({ queryKey: ["my-staff-profile"] });
    },
    onError: () => {
      showToast(t("profile.toast.staffUpdateFailed"), "error");
    },
  });

  const handleClinicSubmit = clinicForm.handleSubmit((data) => {
    updateClinicMutation.mutate({
      name: data.name,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
    });
  });

  const handleStaffSubmit = staffForm.handleSubmit((data) => {
    updateStaffMutation.mutate({
      name: data.name,
      phone: data.phone || undefined,
    });
  });

  const isLoading = clinicLoading || staffLoading;
  const isError = clinicError || staffError;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !clinicProfile || !staffProfile) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t("profile.errorTitle")}</div>
        <p className={styles.errorDetail}>{t("profile.errorDetail")}</p>
        <div className={styles.errorActions}>
          <Button
            variant="secondary"
            onClick={() => {
              refetchClinic();
              refetchStaff();
            }}
          >
            {t("actions.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("profile.title")} />

      {/* Clinic Information (read-only) */}
      <DetailSection title={t("profile.clinicInfo")} columns={2}>
        {isClinicAdmin ? (
          <>
            <FieldDisplay label={t("profile.document")} value={clinicProfile.document} />
            <FieldDisplay label={t("profile.email")} value={clinicProfile.email} />
            <FieldDisplay
              label={t("profile.status")}
              value={<StatusBadge status={clinicProfile.status} />}
            />
            <FieldDisplay
              label={t("profile.registeredAt")}
              value={formatDate(clinicProfile.createdAt)}
            />
          </>
        ) : (
          <>
            <FieldDisplay label={t("profile.clinicName")} value={clinicProfile.name} />
            <FieldDisplay
              label={t("profile.status")}
              value={<StatusBadge status={clinicProfile.status} />}
            />
          </>
        )}
      </DetailSection>

      {/* Clinic Data (editable, CLINIC_ADMIN only) */}
      {isClinicAdmin && (
        <div className={styles.section}>
          <Card title={t("profile.clinicData")}>
            <form
              className={styles.form}
              onSubmit={handleClinicSubmit}
              noValidate
            >
              <Input
                label={t("profile.name")}
                placeholder={t("profile.namePlaceholder")}
                error={clinicForm.formState.errors.name?.message}
                {...clinicForm.register("name", {
                  required: t("validation.required", { field: t("profile.name") }),
                })}
              />
              <Input
                label={t("profile.phone")}
                type="tel"
                placeholder={t("profile.phonePlaceholder")}
                {...clinicForm.register("phone")}
              />
              <Input
                label={t("profile.address")}
                placeholder={t("profile.addressPlaceholder")}
                {...clinicForm.register("address")}
              />
              <div className={styles.formRow}>
                <Input
                  label={t("profile.city")}
                  placeholder={t("profile.cityPlaceholder")}
                  {...clinicForm.register("city")}
                />
                <Select
                  label={t("profile.state")}
                  {...clinicForm.register("state")}
                >
                  <option value="">{t("profile.selectState")}</option>
                  {BRAZILIAN_STATES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className={styles.actions}>
                <Button type="submit" isLoading={updateClinicMutation.isPending}>
                  {t("actions.saveChanges")}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Staff Data (editable for both roles) */}
      <div className={styles.section}>
        <Card title={t("profile.myData")}>
          <form
            className={styles.form}
            onSubmit={handleStaffSubmit}
            noValidate
          >
            <Input
              label={t("profile.name")}
              placeholder={t("profile.namePlaceholder")}
              error={staffForm.formState.errors.name?.message}
              {...staffForm.register("name", {
                required: t("validation.required", { field: t("profile.name") }),
              })}
            />
            <Input
              label={t("profile.phone")}
              type="tel"
              placeholder={t("profile.phonePlaceholder")}
              {...staffForm.register("phone")}
            />
            <div className={styles.actions}>
              <Button type="submit" isLoading={updateStaffMutation.isPending}>
                {t("actions.saveChanges")}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.section}>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
