import { useAuth } from "../../auth/useAuth";
import { SpecialistProfilePage } from "./SpecialistProfilePage";
import { ClinicProfilePage } from "./ClinicProfilePage";
import { AdminProfilePage } from "./AdminProfilePage";

export function ProfilePage() {
  const { roles } = useAuth();

  if (roles.includes("SPECIALIST")) return <SpecialistProfilePage />;
  if (roles.includes("CLINIC_ADMIN") || roles.includes("CLINIC_STAFF"))
    return <ClinicProfilePage />;
  return <AdminProfilePage />;
}
