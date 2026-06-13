import { useState, useEffect } from "react";
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
import { useToast } from "../../components/ui/Toast";
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
      showToast("Profile updated successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      showToast("Failed to update profile.", "error");
    },
  });

  const addAreaMutation = useMutation({
    mutationFn: addMyCoverageArea,
    onSuccess: () => {
      showToast("Coverage area added.", "success");
      setAreaCity("");
      setAreaState("");
      setAreaRadius("");
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast("Failed to add coverage area.", "error");
    },
  });

  const toggleAreaMutation = useMutation({
    mutationFn: toggleMyCoverageArea,
    onSuccess: () => {
      showToast("Coverage area status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast("Failed to update coverage area.", "error");
    },
  });

  const removeAreaMutation = useMutation({
    mutationFn: removeMyCoverageArea,
    onSuccess: () => {
      showToast("Coverage area removed.", "success");
      setRemoveAreaId(null);
      queryClient.invalidateQueries({ queryKey: ["my-coverage-areas"] });
    },
    onError: () => {
      showToast("Failed to remove coverage area.", "error");
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
        <div className={styles.errorTitle}>Failed to load profile</div>
        <p className={styles.errorDetail}>
          Your profile could not be loaded. Please try again.
        </p>
        <div className={styles.errorActions}>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const areaToRemove = coverageAreas?.find((a) => a.id === removeAreaId);

  return (
    <div>
      <PageHeader title={profile.name} subtitle="Specialist profile" />

      <DetailSection title="Professional information" columns={2}>
        <FieldDisplay label="Email" value={profile.email} />
        <FieldDisplay
          label="CRMV"
          value={`${profile.crmv} / ${profile.crmvState}`}
        />
        <FieldDisplay
          label="Specialty"
          value={profile.specialty.replace(/_/g, " ")}
        />
        <FieldDisplay
          label="Status"
          value={<StatusBadge status={profile.status} />}
        />
        <FieldDisplay
          label="Registered"
          value={new Date(profile.createdAt).toLocaleDateString()}
        />
      </DetailSection>

      <div className={styles.section}>
        <Card title="Personal information">
          <form
            className={styles.form}
            onSubmit={handlePersonalSubmit}
            noValidate
          >
            <Input
              label="Name"
              placeholder="Your full name"
              error={personalForm.formState.errors.name?.message}
              {...personalForm.register("name", {
                required: "Name is required",
              })}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="(11) 99999-9999"
              {...personalForm.register("phone")}
            />
            <Textarea
              label="Bio"
              placeholder="A short professional bio..."
              rows={3}
              {...personalForm.register("bio")}
            />
            <div className={styles.actions}>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.section}>
        <Card title="Location & mobility">
          <form
            className={styles.form}
            onSubmit={handleLocationSubmit}
            noValidate
          >
            <div className={styles.formRow}>
              <Input
                label="Base city"
                placeholder="e.g. Sao Paulo"
                {...locationForm.register("baseCity")}
              />
              <Select
                label="Base state"
                {...locationForm.register("baseState")}
              >
                <option value="">Select</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.formRow}>
              <Input
                label="Max travel radius (km)"
                type="number"
                placeholder="e.g. 50"
                {...locationForm.register("maxTravelRadiusKm")}
              />
              <Select
                label="Own equipment"
                {...locationForm.register("hasOwnEquipment")}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div className={styles.actions}>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className={styles.section}>
        <Card title="Coverage areas">
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
                  <option key={st.value} value={st.value}>
                    {st.label}
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
              Add
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
                title="No coverage areas"
                description="Add your first coverage area above to let clinics find you."
              />
            </div>
          )}

          {coverageAreas && coverageAreas.length > 0 && (
            <table className={styles.areaTable}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>State</th>
                  <th>Radius</th>
                  <th>Status</th>
                  <th className={styles.areaTableActionsHeader}>Actions</th>
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
                        {area.active ? "Active" : "Inactive"}
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
                          {area.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveAreaId(area.id)}
                        >
                          Remove
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

      {removeAreaId && areaToRemove && (
        <Dialog
          open={!!removeAreaId}
          onClose={() => setRemoveAreaId(null)}
          title="Remove coverage area"
        >
          <p>
            Are you sure you want to remove{" "}
            <strong>
              {areaToRemove.city}, {areaToRemove.state}
            </strong>{" "}
            from your coverage areas?
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              onClick={() => setRemoveAreaId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={removeAreaMutation.isPending}
              onClick={() => removeAreaMutation.mutate(removeAreaId)}
            >
              Remove
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
