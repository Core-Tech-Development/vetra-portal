import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTutor, updateTutor } from "../../api/tutors";
import { Card, Input, Spinner, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateTutorPage.module.css";

const editTutorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type EditTutorForm = z.infer<typeof editTutorSchema>;

export function EditTutorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: tutor, isLoading } = useQuery({
    queryKey: ["tutor", id],
    queryFn: () => getTutor(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTutorForm>({
    resolver: zodResolver(editTutorSchema),
  });

  useEffect(() => {
    if (tutor) {
      reset({
        name: tutor.name,
        phone: tutor.phone ?? "",
        email: tutor.email ?? "",
        document: tutor.document ?? "",
        address: tutor.address ?? "",
        city: tutor.city ?? "",
        state: tutor.state ?? "",
        zipCode: tutor.zipCode ?? "",
      });
    }
  }, [tutor, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditTutorForm) =>
      updateTutor(id!, {
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
      showToast("Tutor updated successfully.", "success");
      navigate("/tutors");
    },
    onError: () => {
      setApiError("Failed to update tutor. Please try again.");
    },
  });

  const onSubmit = (data: EditTutorForm) => {
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
      <PageHeader
        title="Edit tutor"
        subtitle="Update tutor information."
        backLink={{ label: "Back to tutors", to: "/tutors" }}
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
          </FormSection>

          <FormSection title="Address">
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
          </FormSection>

          <FormActions
            onCancel={() => navigate("/tutors")}
            submitLabel="Save changes"
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}
