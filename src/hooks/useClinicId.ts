export function useClinicId(): string | null {
  return localStorage.getItem("vetra_clinic_id");
}
