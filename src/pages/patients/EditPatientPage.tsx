import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPatient, updatePatient } from "../../api/patients";
import { Button, Card, Input, Select, Spinner, Textarea } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import styles from "./CreatePatientPage.module.css";

const SPECIES_OPTIONS = [
  { value: "DOG", label: "Dog" },
  { value: "CAT", label: "Cat" },
  { value: "BIRD", label: "Bird" },
  { value: "HORSE", label: "Horse" },
  { value: "RABBIT", label: "Rabbit" },
  { value: "REPTILE", label: "Reptile" },
  { value: "OTHER", label: "Other" },
];

const SEX_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const editPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birthDate: z.string().optional(),
  weightKg: z.string().optional(),
  neutered: z.boolean(),
  microchip: z.string().optional(),
  clinicalNotes: z.string().optional(),
});

type EditPatientForm = z.infer<typeof editPatientSchema>;

export function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPatientForm>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        species: patient.species,
        breed: patient.breed ?? "",
        sex: patient.sex ?? "",
        birthDate: patient.birthDate ?? "",
        weightKg: patient.weightKg != null ? String(patient.weightKg) : "",
        neutered: patient.neutered ?? false,
        microchip: patient.microchip ?? "",
        clinicalNotes: patient.clinicalNotes ?? "",
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditPatientForm) =>
      updatePatient(id!, {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        sex: data.sex || undefined,
        birthDate: data.birthDate || undefined,
        weightKg:
          data.weightKg !== "" && data.weightKg !== undefined
            ? Number(data.weightKg)
            : undefined,
        neutered: data.neutered,
        microchip: data.microchip || undefined,
        clinicalNotes: data.clinicalNotes || undefined,
      }),
    onSuccess: () => {
      showToast("Patient updated successfully.", "success");
      navigate("/patients");
    },
    onError: () => {
      setApiError(
        "Failed to update patient. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: EditPatientForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

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
        <h2 className={styles.title}>Edit patient</h2>
        <p className={styles.subtitle}>Update patient information.</p>
      </div>

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <div className={styles.errorBanner}>{apiError}</div>}

          <Input
            label="Patient name"
            placeholder="e.g. Rex"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className={styles.row}>
            <Select
              label="Species"
              error={errors.species?.message}
              {...register("species")}
            >
              <option value="">Select species</option>
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Input
              label="Breed"
              placeholder="e.g. Labrador Retriever"
              error={errors.breed?.message}
              {...register("breed")}
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Sex"
              error={errors.sex?.message}
              {...register("sex")}
            >
              <option value="">Select sex</option>
              {SEX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Input
              label="Birth date"
              type="date"
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Weight (kg)"
              type="number"
              step="0.01"
              placeholder="e.g. 12.5"
              error={errors.weightKg?.message}
              {...register("weightKg")}
            />
            <Input
              label="Microchip"
              placeholder="Microchip number"
              error={errors.microchip?.message}
              {...register("microchip")}
            />
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="neutered"
              {...register("neutered")}
            />
            <label htmlFor="neutered" className={styles.checkboxLabel}>
              Neutered
            </label>
          </div>

          <Textarea
            label="Clinical notes"
            placeholder="Any relevant clinical observations..."
            rows={3}
            error={errors.clinicalNotes?.message}
            {...register("clinicalNotes")}
          />

          <div className={styles.actions}>
            <Link to="/patients">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={mutation.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
