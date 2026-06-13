import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createSpecialist } from "../../api/specialists";
import { Card, Input, Select, Textarea, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import type { CreateSpecialistRequest } from "../../api/types";
import styles from "./CreateSpecialistPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const SPECIALTIES = [
  { value: "ABDOMINAL_ULTRASOUND", label: "Abdominal Ultrasound" },
  { value: "GESTATIONAL_ULTRASOUND", label: "Gestational Ultrasound" },
  { value: "MUSCULOSKELETAL_ULTRASOUND", label: "Musculoskeletal Ultrasound" },
];

const createSpecialistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  crmv: z.string().min(1, "CRMV is required"),
  crmvState: z.string().min(2, "CRMV state is required"),
  specialty: z.string().min(1, "Specialty is required"),
  baseCity: z.string().optional(),
  baseState: z.string().optional(),
  maxTravelRadiusKm: z.string().optional(),
  hasOwnEquipment: z.boolean(),
  bio: z.string().optional(),
});

type CreateSpecialistForm = z.infer<typeof createSpecialistSchema>;

export function CreateSpecialistPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSpecialistForm>({
    resolver: zodResolver(createSpecialistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      crmv: "",
      crmvState: "",
      specialty: "",
      baseCity: "",
      baseState: "",
      maxTravelRadiusKm: "",
      hasOwnEquipment: false,
      bio: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateSpecialistRequest) => createSpecialist(data),
    onSuccess: () => {
      showToast("Specialist created successfully.", "success");
      navigate("/specialists");
    },
    onError: () => {
      setApiError(
        "Failed to create specialist. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreateSpecialistForm) => {
    setApiError(null);
    const payload: CreateSpecialistRequest = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      crmv: data.crmv,
      crmvState: data.crmvState,
      specialty: data.specialty,
      baseCity: data.baseCity || undefined,
      baseState: data.baseState || undefined,
      maxTravelRadiusKm:
        data.maxTravelRadiusKm ? Number(data.maxTravelRadiusKm) : undefined,
      hasOwnEquipment: data.hasOwnEquipment,
      bio: data.bio || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div>
      <PageHeader
        title="New specialist"
        subtitle="Register a new imaging specialist on the platform."
        backLink={{ label: "Back to specialists", to: "/specialists" }}
      />

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <FormSection title="Personal information">
            <Input
              label="Full name"
              placeholder="e.g. Dr. Maria Silva"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label="Email"
                type="email"
                placeholder="specialist@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
          </FormSection>

          <FormSection title="Professional registration">
            <div className={styles.row}>
              <Input
                label="CRMV"
                placeholder="e.g. 12345"
                error={errors.crmv?.message}
                {...register("crmv")}
              />
              <Select
                label="CRMV State"
                error={errors.crmvState?.message}
                {...register("crmvState")}
              >
                <option value="">Select state</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              label="Specialty"
              error={errors.specialty?.message}
              {...register("specialty")}
            >
              <option value="">Select specialty</option>
              {SPECIALTIES.map((sp) => (
                <option key={sp.value} value={sp.value}>
                  {sp.label}
                </option>
              ))}
            </Select>
          </FormSection>

          <FormSection title="Coverage area">
            <div className={styles.row}>
              <Input
                label="Base city"
                placeholder="e.g. Sao Paulo"
                error={errors.baseCity?.message}
                {...register("baseCity")}
              />
              <Select
                label="Base state"
                error={errors.baseState?.message}
                {...register("baseState")}
              >
                <option value="">Select state</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Max travel radius (km)"
              type="number"
              placeholder="e.g. 50"
              error={errors.maxTravelRadiusKm?.message}
              {...register("maxTravelRadiusKm")}
            />

            <div className={styles.checkboxField}>
              <input
                type="checkbox"
                id="hasOwnEquipment"
                {...register("hasOwnEquipment")}
              />
              <label htmlFor="hasOwnEquipment" className={styles.checkboxLabel}>
                Has own equipment
              </label>
            </div>
          </FormSection>

          <FormSection title="Bio">
            <Textarea
              label="Bio"
              placeholder="Brief professional description..."
              error={errors.bio?.message}
              {...register("bio")}
            />
          </FormSection>

          <FormActions
            onCancel={() => navigate("/specialists")}
            submitLabel="Create specialist"
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}
