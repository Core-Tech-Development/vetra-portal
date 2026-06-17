import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  updateMyProfile,
  getMyCoverageAreas,
  addMyCoverageArea,
  toggleMyCoverageArea,
  removeMyCoverageArea,
} from "../../api/specialists";
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Spinner,
  StatusBadge,
  Badge,
  Dialog,
  EmptyState,
} from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ChangePasswordForm } from "../../components/profile/ChangePasswordForm";
import { useToast } from "../../components/ui/Toast";
import { formatDate } from "../../i18n/formatting";
import styles from "./SpecialistProfilePage.module.css";

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

interface PersonalInfoForm {
  name: string;
  phone: string;
  bio: string;
}

interface LocationForm {
  baseCity: string;
  baseState: string;
  maxTravelRadiusKm: string;
  hasOwnEquipment: string;
}

export function SpecialistProfilePage() {
  const { t } = useTranslation(['specialists', 'common']);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [areaCity, setAreaCity] = useState("");
  const [areaState, setAreaState] = useState("");
  const [areaRadius, setAreaRadius] = useState("");
  const [removeAreaId, setRemoveAreaId] = useState<string | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });

  const { data: coverageAreas, isLoading: areasLoading } = useQuery({
    queryKey: ["my-coverage-areas"],
    queryFn: getMyCoverageAreas,
  });

  const personalForm = useForm<PersonalInfoForm>();
  const locationForm = useForm<LocationForm>();

  useEffect(() => {
    if (profile) {
      personalForm.reset({
        name: profile.name,
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
      });
      locationForm.reset({
        baseCity: profile.baseCity ?? "",
        baseState: profile.baseState ?? "",
        maxTravelRadiusKm:
          profile.maxTravelRadiusKm != null
            ? String(profile.maxTravelRadiusKm)
            : "",
        hasOwnEquipment: profile.hasOwnEquipment ? "true" : "false",
      });
    }
  }, [profile, personalForm.reset, locationForm.reset]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      showToast(t('specialists:profile.toast.profileUpdated'), "success");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      showToast(t('specialists:profile.toast.profileUpdateFailed'), "error");
    },
  });

  const addAreaMutation = useMutation({
    mutationFn: addMyCoverageArea,
    onSuccess: () => {
      showToast(t('specialists:profile.toast.areaAdded'), "success");
      setAreaCity("");
      setAreaState("");
      setAreaRadius("");
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast(t('specialists:profile.toast.areaAddFailed'), "error");
    },
  });

  const toggleAreaMutation = useMutation({
    mutationFn: toggleMyCoverageArea,
    onSuccess: () => {
      showToast(t('specialists:profile.toast.areaToggled'), "success");
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast(t('specialists:profile.toast.areaToggleFailed'), "error");
    },
  });

  const removeAreaMutation = useMutation({
    mutationFn: removeMyCoverageArea,
    onSuccess: () => {
      showToast(t('specialists:profile.toast.areaRemoved'), "success");
      setRemoveAreaId(null);
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast(t('specialists:profile.toast.areaRemoveFailed'), "error");
      setRemoveAreaId(null);
    },
  });

  const handlePersonalSubmit = personalForm.handleSubmit((data) => {
    if (!profile) return;
    updateMutation.mutate({
      name: data.name,
      phone: data.phone || undefined,
      bio: data.bio || undefined,
      baseCity: profile.baseCity ?? undefined,
      baseState: profile.baseState ?? undefined,
      maxTravelRadiusKm: profile.maxTravelRadiusKm ?? undefined,
      hasOwnEquipment: profile.hasOwnEquipment,
    });
  });

  const handleLocationSubmit = locationForm.handleSubmit((data) => {
    if (!profile) return;
    updateMutation.mutate({
      name: profile.name,
      phone: profile.phone ?? undefined,
      bio: profile.bio ?? undefined,
      baseCity: data.baseCity || undefined,
      baseState: data.baseState || undefined,
      maxTravelRadiusKm: data.maxTravelRadiusKm
        ? Number(data.maxTravelRadiusKm)
        : undefined,
      hasOwnEquipment: data.hasOwnEquipment === "true",
    });
  });

  const handleAddArea = () => {
    if (!areaCity.trim() || !areaState.trim()) return;
    addAreaMutation.mutate({
      city: areaCity,
      state: areaState,
      radiusKm: areaRadius ? Number(areaRadius) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('specialists:profile.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('specialists:profile.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const areaToRemove = coverageAreas?.find((a) => a.id === removeAreaId);

  return (
    <div>
      <PageHeader title={profile.name} subtitle={t('specialists:profile.subtitle')} />

      <DetailSection title={t('specialists:profile.sections.professionalInformation')} columns={2}>
        <FieldDisplay label={t('specialists:profile.fields.email')} value={profile.email} />
        <FieldDisplay
          label={t('specialists:profile.fields.crmv')}
          value={`${profile.crmv} / ${profile.crmvState}`}
        />
        <FieldDisplay
          label={t('specialists:profile.fields.specialty')}
          value={profile.specialty.replace(/_/g, " ")}
        />
        <FieldDisplay
          label={t('specialists:profile.fields.status')}
          value={<StatusBadge status={profile.status} />}
        />
        <FieldDisplay
          label={t('specialists:profile.fields.registered')}
          value={formatDate(profile.createdAt)}
        />
      </DetailSection>

      <div className={styles.section}>
        <Card title={t('specialists:profile.sections.personalInformation')}>
          <form
            className={styles.form}
            onSubmit={handlePersonalSubmit}
            noValidate
          >
            <Input
              label={t('specialists:profile.fields.name')}
              placeholder={t('specialists:profile.fields.namePlaceholder')}
              error={personalForm.formState.errors.name?.message}
              {...personalForm.register("name", {
                required: t('common:validation.required', { field: t('specialists:profile.fields.name') }),
              })}
            />
            <Input
              label={t('specialists:profile.fields.phone')}
              type="tel"
              placeholder={t('specialists:profile.fields.phonePlaceholder')}
              {...personalForm.register("phone")}
            />
            <Textarea
              label={t('specialists:profile.fields.bio')}
              placeholder={t('specialists:profile.fields.bioPlaceholder')}
              rows={3}
              {...personalForm.register("bio")}
            />
            <div className={styles.actions}>
              <Button type="submit" isLoading={updateMutation.isPending}>
                {t('common:actions.saveChanges')}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.section}>
        <Card title={t('specialists:profile.sections.locationMobility')}>
          <form
            className={styles.form}
            onSubmit={handleLocationSubmit}
            noValidate
          >
            <div className={styles.formRow}>
              <Input
                label={t('specialists:profile.fields.baseCity')}
                placeholder={t('specialists:profile.fields.baseCityPlaceholder')}
                {...locationForm.register("baseCity")}
              />
              <Select
                label={t('specialists:profile.fields.baseState')}
                {...locationForm.register("baseState")}
              >
                <option value="">{t('specialists:profile.coverageAreas.selectState')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.formRow}>
              <Input
                label={t('specialists:profile.fields.maxTravelRadius')}
                type="number"
                placeholder={t('specialists:profile.fields.maxTravelRadiusPlaceholder')}
                {...locationForm.register("maxTravelRadiusKm")}
              />
              <Select
                label={t('specialists:profile.fields.ownEquipment')}
                {...locationForm.register("hasOwnEquipment")}
              >
                <option value="true">{t('common:common.yes')}</option>
                <option value="false">{t('common:common.no')}</option>
              </Select>
            </div>
            <div className={styles.actions}>
              <Button type="submit" isLoading={updateMutation.isPending}>
                {t('common:actions.saveChanges')}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.section}>
        <Card title={t('specialists:profile.sections.coverageAreas')}>
          <div className={styles.addAreaForm}>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:profile.coverageAreas.city')}</label>
              <input
                className={styles.addAreaInput}
                type="text"
                placeholder={t('specialists:profile.coverageAreas.cityPlaceholder')}
                value={areaCity}
                onChange={(e) => setAreaCity(e.target.value)}
              />
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:profile.coverageAreas.state')}</label>
              <select
                className={styles.addAreaInput}
                value={areaState}
                onChange={(e) => setAreaState(e.target.value)}
              >
                <option value="">{t('specialists:profile.coverageAreas.selectState')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:profile.coverageAreas.radius')}</label>
              <input
                className={styles.addAreaInput}
                type="number"
                placeholder={t('specialists:profile.coverageAreas.radiusPlaceholder')}
                value={areaRadius}
                onChange={(e) => setAreaRadius(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddArea}
              isLoading={addAreaMutation.isPending}
              disabled={!areaCity.trim() || !areaState.trim()}
            >
              {t('specialists:profile.coverageAreas.addButton')}
            </Button>
          </div>

          {areasLoading && (
            <div className={styles.areasLoadingContainer}>
              <Spinner />
            </div>
          )}

          {!areasLoading && coverageAreas && coverageAreas.length === 0 && (
            <div className={styles.areasEmptyContainer}>
              <EmptyState
                title={t('specialists:profile.coverageAreas.empty.title')}
                description={t('specialists:profile.coverageAreas.empty.description')}
              />
            </div>
          )}

          {coverageAreas && coverageAreas.length > 0 && (
            <table className={styles.areaTable}>
              <thead>
                <tr>
                  <th>{t('specialists:profile.coverageAreas.city')}</th>
                  <th>{t('specialists:profile.coverageAreas.state')}</th>
                  <th>{t('specialists:profile.coverageAreas.radius')}</th>
                  <th>{t('specialists:profile.coverageAreas.status')}</th>
                  <th className={styles.areaTableActionsHeader}>{t('specialists:profile.coverageAreas.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {coverageAreas.map((area) => (
                  <tr key={area.id}>
                    <td>{area.city}</td>
                    <td>{area.state}</td>
                    <td>{area.radiusKm != null ? `${area.radiusKm} km` : "--"}</td>
                    <td>
                      <Badge variant={area.active ? "success" : "neutral"}>
                        {area.active ? t('common:status.ACTIVE') : t('common:status.INACTIVE')}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.areaActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAreaMutation.mutate(area.id)}
                          isLoading={toggleAreaMutation.isPending}
                        >
                          {area.active ? t('specialists:profile.coverageAreas.deactivate') : t('specialists:profile.coverageAreas.activate')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveAreaId(area.id)}
                        >
                          {t('specialists:profile.coverageAreas.remove')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className={styles.section}>
        <ChangePasswordForm />
      </div>

      {removeAreaId && areaToRemove && (
        <Dialog
          open={!!removeAreaId}
          onClose={() => setRemoveAreaId(null)}
          title={t('specialists:profile.coverageAreas.removeDialog.title')}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: t('specialists:profile.coverageAreas.removeDialog.message', {
                city: areaToRemove.city,
                state: areaToRemove.state,
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setRemoveAreaId(null)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={removeAreaMutation.isPending}
              onClick={() => removeAreaMutation.mutate(removeAreaId)}
            >
              {t('common:actions.remove')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
