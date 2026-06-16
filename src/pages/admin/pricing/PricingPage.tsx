import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { formatCurrency } from "../../../i18n/formatting";
import styles from "./PricingPage.module.css";

export function PricingPage() {
  const { t } = useTranslation(['admin', 'common']);
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
      showToast(t('admin:pricing.toast.created'), "success");
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      showToast(t('admin:pricing.toast.createFailed'), "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamTypePricingRequest }) =>
      updateExamTypePricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-type-pricings"] });
      showToast(t('admin:pricing.toast.updated'), "success");
      setEditingPricing(null);
      resetForm();
    },
    onError: () => {
      showToast(t('admin:pricing.toast.updateFailed'), "error");
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
      showToast(t('admin:pricing.toast.invalidPrice'), "error");
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
      showToast(t('admin:pricing.toast.invalidPrice'), "error");
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
      header: t('admin:pricing.columns.examType'),
      render: (row) => row.examType.replace(/_/g, " "),
    },
    {
      key: "priceCents",
      header: t('admin:pricing.columns.price'),
      render: (row) => formatCurrency(row.priceCents),
    },
    {
      key: "platformFeePercent",
      header: t('admin:pricing.columns.platformFee'),
      render: (row) => `${row.platformFeePercent}%`,
    },
    {
      key: "platformFeeCents",
      header: t('admin:pricing.columns.feeAmount'),
      render: (row) =>
        formatCurrency(Math.round((row.priceCents * row.platformFeePercent) / 100)),
    },
    {
      key: "active",
      header: t('admin:pricing.columns.status'),
      render: (row) => (
        <Badge variant={row.active ? "success" : "neutral"}>
          {row.active ? t('common:status.ACTIVE') : t('common:status.INACTIVE')}
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
        title={t('admin:pricing.title')}
        actions={
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus size={16} />
            {t('admin:pricing.addPricing')}
          </Button>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('admin:pricing.error')}
        onRetry={() => refetch()}
        emptyState={{
          title: t('admin:pricing.empty.title'),
          description: t('admin:pricing.empty.description'),
        }}
        page={0}
        totalPages={0}
        onPageChange={() => {}}
      />

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title={t('admin:pricing.createDialog.title')}
      >
        <div className={styles.form}>
          <Input
            label={t('admin:pricing.createDialog.examTypeLabel')}
            placeholder={t('admin:pricing.createDialog.examTypePlaceholder')}
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          />
          <Input
            label={t('admin:pricing.createDialog.priceLabel')}
            type="number"
            step="0.01"
            min="0"
            placeholder={t('admin:pricing.createDialog.pricePlaceholder')}
            value={priceReais}
            onChange={(e) => setPriceReais(e.target.value)}
          />
          <Input
            label={t('admin:pricing.createDialog.platformFeeLabel')}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder={t('admin:pricing.createDialog.platformFeePlaceholder')}
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!examType || !priceReais || createMutation.isPending}
            >
              {createMutation.isPending ? t('admin:pricing.createDialog.creatingButton') : t('admin:pricing.createDialog.createButton')}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingPricing !== null}
        onClose={() => setEditingPricing(null)}
        title={t('admin:pricing.editDialog.title')}
      >
        <div className={styles.form}>
          <Input
            label={t('admin:pricing.createDialog.examTypeLabel')}
            value={editingPricing?.examType.replace(/_/g, " ") ?? ""}
            disabled
          />
          <Input
            label={t('admin:pricing.createDialog.priceLabel')}
            type="number"
            step="0.01"
            min="0"
            value={priceReais}
            onChange={(e) => setPriceReais(e.target.value)}
          />
          <Input
            label={t('admin:pricing.createDialog.platformFeeLabel')}
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
            {t('admin:pricing.editDialog.activeLabel')}
          </label>
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setEditingPricing(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!priceReais || updateMutation.isPending}
            >
              {updateMutation.isPending ? t('admin:pricing.editDialog.savingButton') : t('common:actions.save')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
