import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createTutor } from "../../api/tutors";
import { Button, Card, Input } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import styles from "./CreateTutorPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

const createTutorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type CreateTutorForm = z.infer<typeof createTutorSchema>;

export function CreateTutorPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = getClinicId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTutorForm>({
    resolver: zodResolver(createTutorSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTutorForm) =>
      createTutor(clinicId, {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        document: data.document,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
      }),
    onSuccess: () => {
      showToast("Tutor created successfully.", "success");
      navigate("/tutors");
    },
    onError: () => {
      setApiError(
        "Failed to create tutor. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreateTutorForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>New tutor</h2>
        <p className={styles.subtitle}>
          Register a new pet tutor for the clinic.
        </p>
      </div>

      <Card>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {apiError && <div className={styles.errorBanner}>{apiError}</div>}

          <Input
            label="Full name"
            placeholder="e.g. Joao da Silva"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className={styles.row}>
            <Input
              label="Phone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tutor@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Input
            label="Document"
            placeholder="CPF"
            error={errors.document?.message}
            {...register("document")}
          />

          <Input
            label="Address"
            placeholder="Rua das Flores, 123"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className={styles.row}>
            <Input
              label="City"
              placeholder="Sao Paulo"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="State"
              placeholder="SP"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>

          <Input
            label="Zip code"
            placeholder="01001-000"
            error={errors.zipCode?.message}
            {...register("zipCode")}
          />

          <div className={styles.actions}>
            <Link to="/tutors">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={mutation.isPending}>
              Create tutor
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
