import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listExamTypePricings,
  createExamTypePricing,
  updateExamTypePricing,
} from "../../../api/billing";
import type {
  ExamTypePricingResponse,
  CreateExamTypePricingRequest,
  UpdateExamTypePricingRequest,
} from "../../../api/types";
import { Button, Badge, Input, Dialog } from "../../../components/ui";
import type { TableColumn } from "../../../components/ui";
import { PageHeader, DataTableLayout } from "../../../components/patterns";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../../../components/ui";
import styles from "./PricingPage.module.css";

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function PricingPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ExamTypePricingResponse | null>(null);

  // Form state
  const [examType, setExamType] = useState("");
  const [priceReais, setPriceReais] = useState("");
  const [feePercent, setFeePercent] = useState("12.00");
  const [active, setActive] = useState(true);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["exam-type-pricings"],
    queryFn: listExamTypePricings,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateExamTypePricingRequest) => createExamTypePricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-type-pricings"] });
      showToast("Pricing created successfully", "success");
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      showToast("Failed to create pricing", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamTypePricingRequest }) =>
      updateExamTypePricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-type-pricings"] });
      showToast("Pricing updated successfully", "success");
      setEditingPricing(null);
      resetForm();
    },
    onError: () => {
      showToast("Failed to update pricing", "error");
    },
  });

  function resetForm() {
    setExamType("");
    setPriceReais("");
    setFeePercent("12.00");
    setActive(true);
  }

  function handleCreate() {
    const priceCents = Math.round(parseFloat(priceReais) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      showToast("Invalid price value", "error");
      return;
    }
    createMutation.mutate({
      examType,
      priceCents,
      platformFeePercent: parseFloat(feePercent),
    });
  }

  function handleUpdate() {
    if (!editingPricing) return;
    const priceCents = Math.round(parseFloat(priceReais) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      showToast("Invalid price value", "error");
      return;
    }
    updateMutation.mutate({
      id: editingPricing.id,
      data: {
        priceCents,
        platformFeePercent: parseFloat(feePercent),
        active,
      },
    });
  }

  function openEdit(pricing: ExamTypePricingResponse) {
    setEditingPricing(pricing);
    setPriceReais((pricing.priceCents / 100).toFixed(2));
    setFeePercent(String(pricing.platformFeePercent));
    setActive(pricing.active);
  }

  const columns: TableColumn<ExamTypePricingResponse>[] = [
    {
      key: "examType",
      header: "Exam type",
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "priceCents",
      header: "Price",
      render: (row) => formatCurrency(row.priceCents),
    },
    {
      key: "platformFeePercent",
      header: "Platform fee",
      render: (row) => `${row.platformFeePercent}%`,
    },
    {
      key: "platformFeeCents",
      header: "Fee amount",
      render: (row) =>
        formatCurrency(Math.round((row.priceCents * row.platformFeePercent) / 100)),
    },
    {
      key: "active",
      header: "Status",
      render: (row) => (
        <Badge variant={row.active ? "success" : "neutral"}>
          {row.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
          <Pencil size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Exam pricing"
        actions={
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus size={16} />
            Add pricing
          </Button>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load pricings"
        onRetry={() => refetch()}
        emptyState={{
          title: "No pricings configured",
          description: "Add exam type pricings to enable billing when laudos are issued.",
        }}
        page={0}
        totalPages={0}
        onPageChange={() => {}}
      />

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Add exam pricing"
      >
        <div className={styles.form}>
          <Input
            label="Exam type"
            placeholder="e.g. ABDOMINAL_ULTRASOUND"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          />
          <Input
            label="Price (R$)"
            type="number"
            step="0.01"
            min="0"
            placeholder="150.00"
            value={priceReais}
            onChange={(e) => setPriceReais(e.target.value)}
          />
          <Input
            label="Platform fee (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="12.00"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!examType || !priceReais || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingPricing !== null}
        onClose={() => setEditingPricing(null)}
        title="Edit exam pricing"
      >
        <div className={styles.form}>
          <Input
            label="Exam type"
            value={editingPricing?.examType.replace(/_/g, " ") ?? ""}
            disabled
          />
          <Input
            label="Price (R$)"
            type="number"
            step="0.01"
            min="0"
            value={priceReais}
            onChange={(e) => setPriceReais(e.target.value)}
          />
          <Input
            label="Platform fee (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setEditingPricing(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!priceReais || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
