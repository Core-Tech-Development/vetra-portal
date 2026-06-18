import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpecialist,
  approveSpecialist,
  listCoverageAreas,
  addCoverageArea,
  removeCoverageArea,
} from "../../api/specialists";
import { deleteSpecialist } from "../../api/admin";
import { Button, Card, StatusBadge, Spinner, Dialog } from "../../components/ui";
import { PageHeader, DetailSection, FieldDisplay } from "../../components/patterns";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../i18n/formatting";
import styles from "./SpecialistDetailPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export function SpecialistDetailPage() {
  const { t } = useTranslation(['specialists', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { roles } = useAuth();
  const isAdmin = roles.includes("PLATFORM_ADMIN");

  const [areaCity, setAreaCity] = useState("");
  const [areaState, setAreaState] = useState("");
  const [areaRadius, setAreaRadius] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: specialist, isLoading, isError, refetch } = useQuery({
    queryKey: ["specialist", id],
    queryFn: () => getSpecialist(id!),
    enabled: !!id,
  });

  const { data: coverageAreas, isLoading: areasLoading } = useQuery({
    queryKey: ["specialist", id, "coverage-areas"],
    queryFn: () => listCoverageAreas(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => approveSpecialist(id!),
    onSuccess: () => {
      showToast(t('specialists:detail.toast.approved'), "success");
      queryClient.invalidateQueries({ queryKey: ["specialist", id] });
    },
    onError: () => {
      showToast(t('specialists:detail.toast.approveFailed'), "error");
    },
  });

  const addAreaMutation = useMutation({
    mutationFn: () =>
      addCoverageArea(id!, {
        city: areaCity,
        state: areaState,
        radiusKm: areaRadius ? Number(areaRadius) : undefined,
      }),
    onSuccess: () => {
      showToast(t('specialists:detail.toast.areaAdded'), "success");
      setAreaCity("");
      setAreaState("");
      setAreaRadius("");
      queryClient.invalidateQueries({
        queryKey: ["specialist", id, "coverage-areas"],
      });
    },
    onError: () => {
      showToast(t('specialists:detail.toast.areaAddFailed'), "error");
    },
  });

  const removeAreaMutation = useMutation({
    mutationFn: (areaId: string) => removeCoverageArea(id!, areaId),
    onSuccess: () => {
      showToast(t('specialists:detail.toast.areaRemoved'), "success");
      queryClient.invalidateQueries({
        queryKey: ["specialist", id, "coverage-areas"],
      });
    },
    onError: () => {
      showToast(t('specialists:detail.toast.areaRemoveFailed'), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSpecialist(id!),
    onSuccess: () => {
      showToast(t('specialists:deleteDialog.success'), 'success');
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      navigate("/specialists");
    },
    onError: () => {
      showToast(t('specialists:deleteDialog.error'), 'error');
      setShowDeleteDialog(false);
    },
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !specialist) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>{t('specialists:detail.error.title')}</div>
        <p className={styles.errorDetail}>
          {t('specialists:detail.error.detail')}
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
          <Link to="/specialists">
            <Button variant="outline">{t('specialists:detail.error.backButton')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddArea = () => {
    if (!areaCity.trim() || !areaState.trim()) return;
    addAreaMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title={specialist.name}
        backLink={{ label: t('specialists:detail.backLink'), to: "/specialists" }}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge status={specialist.status} />
            {specialist.status === "PENDING_APPROVAL" && (
              <Button
                onClick={() => approveMutation.mutate()}
                isLoading={approveMutation.isPending}
              >
                {t('common:actions.approve')}
              </Button>
            )}
            <Link to="/specialists">
              <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
                {t('specialists:detail.backLink')}
              </Button>
            </Link>
            {isAdmin && (
              <Button
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={() => setShowDeleteDialog(true)}
              >
                {t('common:actions.delete')}
              </Button>
            )}
          </div>
        }
      />

      <DetailSection title={t('specialists:detail.sections.specialistInformation')} columns={3}>
        <FieldDisplay label={t('specialists:detail.fields.email')} value={specialist.email} />
        <FieldDisplay label={t('specialists:detail.fields.phone')} value={specialist.phone || "--"} />
        <FieldDisplay
          label={t('specialists:detail.fields.crmv')}
          value={`${specialist.crmv} / ${specialist.crmvState}`}
        />
        <FieldDisplay
          label={t('specialists:detail.fields.specialty')}
          value={specialist.specialty.replace(/_/g, " ")}
        />
        <FieldDisplay
          label={t('specialists:detail.fields.baseLocation')}
          value={
            specialist.baseCity && specialist.baseState
              ? `${specialist.baseCity}, ${specialist.baseState}`
              : "--"
          }
        />
        <FieldDisplay
          label={t('specialists:detail.fields.maxTravelRadius')}
          value={
            specialist.maxTravelRadiusKm
              ? `${specialist.maxTravelRadiusKm} km`
              : "--"
          }
        />
        <FieldDisplay
          label={t('specialists:detail.fields.ownEquipment')}
          value={specialist.hasOwnEquipment ? t('common:common.yes') : t('common:common.no')}
        />
        <FieldDisplay
          label={t('specialists:detail.fields.registered')}
          value={formatDate(specialist.createdAt)}
        />
        {specialist.bio && (
          <FieldDisplay label={t('specialists:detail.fields.bio')} value={specialist.bio} fullWidth />
        )}
      </DetailSection>

      <div className={styles.section}>
        <Card title={t('specialists:detail.sections.coverageAreas')}>
          {areasLoading && (
            <div className={styles.loadingContainer}>
              <Spinner />
            </div>
          )}

          {coverageAreas && coverageAreas.length === 0 && (
            <div className={styles.emptyAreas}>
              {t('specialists:detail.coverageAreas.empty')}
            </div>
          )}

          {coverageAreas && coverageAreas.length > 0 && (
            <div className={styles.areaList}>
              {coverageAreas.map((area) => (
                <div key={area.id} className={styles.areaItem}>
                  <div>
                    <span className={styles.areaInfo}>
                      {area.city}, {area.state}
                    </span>
                    {area.radiusKm && (
                      <span className={styles.areaRadius}>
                        ({area.radiusKm} km)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeAreaMutation.mutate(area.id)}
                    isLoading={removeAreaMutation.isPending}
                  >
                    {t('specialists:detail.coverageAreas.remove')}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addAreaForm}>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:detail.coverageAreas.city')}</label>
              <input
                className={styles.addAreaInput}
                type="text"
                placeholder={t('specialists:detail.coverageAreas.cityPlaceholder')}
                value={areaCity}
                onChange={(e) => setAreaCity(e.target.value)}
              />
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:detail.coverageAreas.state')}</label>
              <select
                className={styles.addAreaInput}
                value={areaState}
                onChange={(e) => setAreaState(e.target.value)}
              >
                <option value="">{t('specialists:detail.coverageAreas.selectState')}</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>{t('specialists:detail.coverageAreas.radiusKm')}</label>
              <input
                className={styles.addAreaInput}
                type="number"
                placeholder={t('specialists:detail.coverageAreas.radiusPlaceholder')}
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
              {t('specialists:detail.coverageAreas.addArea')}
            </Button>
          </div>
        </Card>
      </div>

      {showDeleteDialog && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('specialists:deleteDialog.title')}
        >
          <p dangerouslySetInnerHTML={{ __html: t('specialists:deleteDialog.message', { name: specialist.name }) }} />
          <p className={styles.dialogWarning}>
            {t('specialists:deleteDialog.warning')}
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {t('common:actions.delete')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
