import { Button } from "../ui";
import styles from "./FormActions.module.css";

interface FormActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function FormActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  isSubmitting = false,
  submitDisabled = false,
}: FormActionsProps) {
  return (
    <div className={styles.root}>
      <Button
        variant="secondary"
        type="button"
        onClick={onCancel}
        className={styles.cancel}
      >
        {cancelLabel}
      </Button>
      <Button
        variant="primary"
        type="submit"
        isLoading={isSubmitting}
        disabled={submitDisabled || isSubmitting}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
