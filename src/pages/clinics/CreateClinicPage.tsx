import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createClinic } from "../../api/clinics";
import { Button, Card, Input, Select } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import type { CreateClinicRequest } from "../../api/types";
import styles from "./CreateClinicPage.module.css";

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const createClinicSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  document: z.string().min(14, "Enter a valid CNPJ"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  address: z.string().min(5, "Enter the full address"),
  city: z.string().min(2, "Enter the city"),
  state: z.string().min(2, "Select a state"),
});

type CreateClinicForm = z.infer<typeof createClinicSchema>;

export function CreateClinicPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClinicForm>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateClinicRequest) => createClinic(data),
    onSuccess: () => {
      showToast("Clinic created successfully.", "success");
      navigate("/clinics");
    },
    onError: () => {
      setApiError(
        "Failed to create clinic. Please check the information and try again."
      );
    },
  });

  const onSubmit = (data: CreateClinicForm) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>New clinic</h2>
        <p className={styles.subtitle}>
          Register a new veterinary clinic on the platform.
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
            label="Clinic name"
            placeholder="e.g. PetVida Veterinary Clinic"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className={styles.row}>
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              error={errors.document?.message}
              {...register("document")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contact@clinic.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Phone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Select
              label="State"
              error={errors.state?.message}
              {...register("state")}
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
            label="City"
            placeholder="e.g. Sao Paulo"
            error={errors.city?.message}
            {...register("city")}
          />

          <Input
            label="Address"
            placeholder="Full address"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className={styles.actions}>
            <Link to="/clinics">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={mutation.isPending}>
              Create clinic
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
