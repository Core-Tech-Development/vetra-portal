import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpecialist,
  approveSpecialist,
  listCoverageAreas,
  addCoverageArea,
  removeCoverageArea,
} from "../../api/specialists";
import { Button, Card, StatusBadge, Spinner } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import styles from "./SpecialistDetailPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export function SpecialistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [areaCity, setAreaCity] = useState("");
  const [areaState, setAreaState] = useState("");
  const [areaRadius, setAreaRadius] = useState("");

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
      showToast("Specialist approved successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["specialist", id] });
    },
    onError: () => {
      showToast("Failed to approve specialist.", "error");
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
      showToast("Coverage area added.", "success");
      setAreaCity("");
      setAreaState("");
      setAreaRadius("");
      queryClient.invalidateQueries({
        queryKey: ["specialist", id, "coverage-areas"],
      });
    },
    onError: () => {
      showToast("Failed to add coverage area.", "error");
    },
  });

  const removeAreaMutation = useMutation({
    mutationFn: (areaId: string) => removeCoverageArea(id!, areaId),
    onSuccess: () => {
      showToast("Coverage area removed.", "success");
      queryClient.invalidateQueries({
        queryKey: ["specialist", id, "coverage-areas"],
      });
    },
    onError: () => {
      showToast("Failed to remove coverage area.", "error");
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !specialist) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorTitle}>Failed to load specialist</div>
        <p className={styles.errorDetail}>
          The specialist could not be found or an error occurred.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link to="/specialists">
            <Button variant="outline">Back to specialists</Button>
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{specialist.name}</h2>
          <StatusBadge status={specialist.status} />
        </div>
        <div className={styles.headerActions}>
          {specialist.status === "PENDING_APPROVAL" && (
            <Button
              onClick={() => approveMutation.mutate()}
              isLoading={approveMutation.isPending}
            >
              Approve
            </Button>
          )}
          <Link to="/specialists">
            <Button variant="secondary">Back to specialists</Button>
          </Link>
        </div>
      </div>

      <Card title="Specialist information">
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{specialist.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>
              {specialist.phone || "--"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>CRMV</span>
            <span className={styles.fieldValue}>
              {specialist.crmv} / {specialist.crmvState}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Specialty</span>
            <span className={styles.fieldValue}>
              {specialist.specialty.replace(/_/g, " ")}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Base location</span>
            <span className={styles.fieldValue}>
              {specialist.baseCity && specialist.baseState
                ? `${specialist.baseCity}, ${specialist.baseState}`
                : "--"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Max travel radius</span>
            <span className={styles.fieldValue}>
              {specialist.maxTravelRadiusKm
                ? `${specialist.maxTravelRadiusKm} km`
                : "--"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Own equipment</span>
            <span className={styles.fieldValue}>
              {specialist.hasOwnEquipment ? "Yes" : "No"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Registered</span>
            <span className={styles.fieldValue}>
              {new Date(specialist.createdAt).toLocaleDateString()}
            </span>
          </div>
          {specialist.bio && (
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.fieldLabel}>Bio</span>
              <span className={styles.fieldValue}>{specialist.bio}</span>
            </div>
          )}
        </div>
      </Card>

      <div className={styles.section}>
        <Card title="Coverage areas">
          {areasLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
              <Spinner />
            </div>
          )}

          {coverageAreas && coverageAreas.length === 0 && (
            <div className={styles.emptyAreas}>
              No coverage areas registered yet.
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
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addAreaForm}>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>City</label>
              <input
                className={styles.addAreaInput}
                type="text"
                placeholder="e.g. Sao Paulo"
                value={areaCity}
                onChange={(e) => setAreaCity(e.target.value)}
              />
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>State</label>
              <select
                className={styles.addAreaInput}
                value={areaState}
                onChange={(e) => setAreaState(e.target.value)}
              >
                <option value="">Select</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.addAreaField}>
              <label className={styles.addAreaLabel}>Radius (km)</label>
              <input
                className={styles.addAreaInput}
                type="number"
                placeholder="e.g. 30"
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
              Add area
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
