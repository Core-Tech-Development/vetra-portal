import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getClinicStaff, updateClinicStaff } from "../../api/clinicStaff";
import { Card, Input, Select, Spinner, Alert } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, FormSection, FormActions } from "../../components/patterns";
import styles from "./CreateStaffPage.module.css";

const editStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
});

type EditStaffForm = z.infer<typeof editStaffSchema>;

export function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["clinic-staff-detail", id],
    queryFn: () => getClinicStaff(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStaffForm>({
    resolver: zodResolver(editStaffSchema),
  });

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        phone: staff.phone ?? "",
        role: staff.role,
      });
    }
  }, [staff, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditStaffForm) =>
      updateClinicStaff(id!, {
        name: data.name,
        phone: data.phone || undefined,
        role: data.role,
      }),
    onSuccess: () => {
      showToast("Collaborator updated successfully.", "success");
      navigate("/staff");
    },
    onError: () => {
      setApiError("Failed to update collaborator. Please try again.");
    },
  });

  const onSubmit = (data: EditStaffForm) => {
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
        title="Edit collaborator"
        subtitle="Update collaborator information."
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
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Email
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    padding: "0.5rem 0",
                  }}
                >
                  {staff?.email ?? "-"}
                </span>
              </div>
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

          <FormActions
            onCancel={() => navigate("/staff")}
            submitLabel="Save changes"
            isSubmitting={mutation.isPending}
          />
        </form>
      </Card>
    </div>
  );
}
