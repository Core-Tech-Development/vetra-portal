import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPatient } from "../../api/patients";
import { listTutorsByClinic } from "../../api/tutors";
import { useClinicId } from "../../hooks/useClinicId";
import { Button, Card, Input, Select, Textarea } from "../../components/ui";
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

const createPatientSchema = z.object({
  tutorId: z.string().min(1, "Tutor is required"),
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

type CreatePatientForm = z.infer<typeof createPatientSchema>;

export function CreatePatientPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = useClinicId();

  const { data: tutorsData } = useQuery({
    queryKey: ["tutors", clinicId],
    queryFn: () => listTutorsByClinic(clinicId!, 0, 100),
    enabled: !!clinicId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePatientForm>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      tutorId: "",
      name: "",
      species: "",
      breed: "",
      sex: "",
      birthDate: "",
      weightKg: "",
      neutered: false,
      microchip: "",
      clinicalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePatientForm) => {
      const { tutorId, ...rest } = data;
      return createPatient(clinicId!, tutorId, {
        name: rest.name,
        species: rest.species,
        breed: rest.breed || undefined,
        sex: rest.sex || undefined,
        birthDate: rest.birthDate || undefined,
        weightKg:
          rest.weightKg !== "" && rest.weightKg !== undefined
            ? Number(rest.weightKg)
            : undefined,
        neutered: rest.neutered,
        microchip: rest.microchip || undefined,
        clinicalNotes: rest.clinicalNotes || undefined,
      });
    },
    onSuccess: () => {
      showToast("Patient created successfully.", "success");
      navigate("/patients");
    },
    onError: () => {
      setApiError(
        "Failed to create patient. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreatePatientForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>New patient</h2>
        <p className={styles.subtitle}>
          Register a new patient for the clinic.
        </p>
      </div>

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <div className={styles.errorBanner}>{apiError}</div>}

          <Select
            label="Tutor"
            error={errors.tutorId?.message}
            {...register("tutorId")}
          >
            <option value="">Select a tutor</option>
            {tutorsData?.content.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.name}
              </option>
            ))}
          </Select>

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
              Create patient
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
