import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createClinicStaff } from "../../api/clinicStaff";
import { Card, Input, Select, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateStaffPage.module.css";

function getClinicId(): string {
  return localStorage.getItem("vetra_clinic_id") || "";
}

const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Valid email required"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CreateStaffForm = z.infer<typeof createStaffSchema>;

export function CreateStaffPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const clinicId = getClinicId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStaffForm>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateStaffForm) =>
      createClinicStaff(clinicId, {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        password: data.password,
      }),
    onSuccess: () => {
      showToast("Collaborator created successfully.", "success");
      navigate("/staff");
    },
    onError: () => {
      setApiError(
        "Failed to create collaborator. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreateStaffForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <PageHeader
        title="New collaborator"
        subtitle="Register a new staff member for the clinic."
        backLink={{ label: "Back to staff", to: "/staff" }}
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
              placeholder="e.g. Maria Silva"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className={styles.row}>
              <Input
                label="Email"
                type="email"
                placeholder="collaborator@clinic.com"
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

            <Select
              label="Role"
              error={errors.role?.message}
              {...register("role")}
            >
              <option value="">Select role</option>
              <option value="VETERINARIAN">Veterinarian</option>
              <option value="SECRETARY">Secretary</option>
            </Select>
          </FormSection>

          <FormSection title="Credentials">
            <div className={styles.row}>
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </FormSection>

          <FormActions
            onCancel={() => navigate("/staff")}
            submitLabel="Create collaborator"
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}
