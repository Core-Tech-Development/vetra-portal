import { Routes, Route } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../auth/roles";
import { LoginPage } from "../pages/LoginPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { PendingApprovalPage } from "../pages/PendingApprovalPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ClinicListPage } from "../pages/clinics/ClinicListPage";
import { CreateClinicPage } from "../pages/clinics/CreateClinicPage";
import { ClinicDetailPage } from "../pages/clinics/ClinicDetailPage";
import { SpecialistListPage } from "../pages/specialists/SpecialistListPage";
import { CreateSpecialistPage } from "../pages/specialists/CreateSpecialistPage";
import { SpecialistDetailPage } from "../pages/specialists/SpecialistDetailPage";
import { StaffListPage } from "../pages/staff/StaffListPage";
import { CreateStaffPage } from "../pages/staff/CreateStaffPage";
import { EditStaffPage } from "../pages/staff/EditStaffPage";
import { StaffDetailPage } from "../pages/staff/StaffDetailPage";
import { TutorListPage } from "../pages/tutors/TutorListPage";
import { CreateTutorPage } from "../pages/tutors/CreateTutorPage";
import { EditTutorPage } from "../pages/tutors/EditTutorPage";
import { TutorDetailPage } from "../pages/tutors/TutorDetailPage";
import { PatientListPage } from "../pages/patients/PatientListPage";
import { CreatePatientPage } from "../pages/patients/CreatePatientPage";
import { EditPatientPage } from "../pages/patients/EditPatientPage";
import { PatientDetailPage } from "../pages/patients/PatientDetailPage";
import { ExamRequestListPage } from "../pages/exam-requests/ExamRequestListPage";
import { CreateExamRequestPage } from "../pages/exam-requests/CreateExamRequestPage";
import { ExamRequestDetailPage } from "../pages/exam-requests/ExamRequestDetailPage";
import { AppointmentListPage } from "../pages/appointments/AppointmentListPage";
import { AppointmentDetailPage } from "../pages/appointments/AppointmentDetailPage";
import { SchedulePage } from "../pages/schedule/SchedulePage";
import { LaudoListPage } from "../pages/laudos/LaudoListPage";
import { CreateLaudoPage } from "../pages/laudos/CreateLaudoPage";
import { LaudoDetailPage } from "../pages/laudos/LaudoDetailPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminApprovalsPage } from "../pages/admin/AdminApprovalsPage";
import { AuditLogPage } from "../pages/admin/AuditLogPage";
import { SpecialistProfilePage } from "../pages/profile/SpecialistProfilePage";

function ClinicStatusGuard({ children }: { children: React.ReactNode }) {
  const { roles, clinicStatus } = useAuth();
  const isClinicUser = roles.some(
    (r) => r === ROLES.CLINIC_ADMIN || r === ROLES.CLINIC_STAFF,
  );

  if (isClinicUser && clinicStatus && clinicStatus !== "ACTIVE") {
    return <PendingApprovalPage status={clinicStatus} />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <ClinicStatusGuard>
              <AppLayout />
            </ClinicStatusGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Clinics */}
        <Route
          path="clinics"
          element={
            <ProtectedRoute
              requiredRoles={[
                ROLES.PLATFORM_ADMIN,
                ROLES.PLATFORM_OPERATOR,
                ROLES.CLINIC_ADMIN,
              ]}
            >
              <ClinicListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clinics/new"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <CreateClinicPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clinics/:id"
          element={
            <ProtectedRoute
              requiredRoles={[
                ROLES.PLATFORM_ADMIN,
                ROLES.PLATFORM_OPERATOR,
                ROLES.CLINIC_ADMIN,
              ]}
            >
              <ClinicDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Specialists */}
        <Route
          path="specialists"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <SpecialistListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="specialists/new"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <CreateSpecialistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="specialists/:id"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <SpecialistDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Tutors */}
        <Route
          path="tutors"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <TutorListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tutors/new"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <CreateTutorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tutors/:id/edit"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <EditTutorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tutors/:id"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <TutorDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Staff */}
        <Route
          path="staff"
          element={
            <ProtectedRoute requiredRoles={[ROLES.CLINIC_ADMIN]}>
              <StaffListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/new"
          element={
            <ProtectedRoute requiredRoles={[ROLES.CLINIC_ADMIN]}>
              <CreateStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/:id/edit"
          element={
            <ProtectedRoute requiredRoles={[ROLES.CLINIC_ADMIN]}>
              <EditStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/:id"
          element={
            <ProtectedRoute requiredRoles={[ROLES.CLINIC_ADMIN]}>
              <StaffDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Patients */}
        <Route
          path="patients"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <PatientListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/new"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <CreatePatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/:id/edit"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <EditPatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/:id"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <PatientDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Exam Requests */}
        <Route
          path="exam-requests"
          element={
            <ProtectedRoute
              requiredRoles={[
                ROLES.CLINIC_ADMIN,
                ROLES.CLINIC_STAFF,
                ROLES.SPECIALIST,
              ]}
            >
              <ExamRequestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="exam-requests/new"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.CLINIC_ADMIN, ROLES.CLINIC_STAFF]}
            >
              <CreateExamRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="exam-requests/:id"
          element={
            <ProtectedRoute
              requiredRoles={[
                ROLES.CLINIC_ADMIN,
                ROLES.CLINIC_STAFF,
                ROLES.SPECIALIST,
              ]}
            >
              <ExamRequestDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Appointments */}
        <Route path="appointments" element={<AppointmentListPage />} />
        <Route path="appointments/:id" element={<AppointmentDetailPage />} />

        {/* Schedule (Specialist) */}
        <Route
          path="schedule"
          element={
            <ProtectedRoute requiredRoles={[ROLES.SPECIALIST]}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />

        {/* Laudos */}
        <Route path="laudos" element={<LaudoListPage />} />
        <Route
          path="laudos/new/:appointmentId"
          element={
            <ProtectedRoute requiredRoles={[ROLES.SPECIALIST]}>
              <CreateLaudoPage />
            </ProtectedRoute>
          }
        />
        <Route path="laudos/:id" element={<LaudoDetailPage />} />

        {/* Admin */}
        <Route
          path="admin"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/approvals"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <AdminApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit"
          element={
            <ProtectedRoute
              requiredRoles={[ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_OPERATOR]}
            >
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        {/* Specialist Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredRoles={[ROLES.SPECIALIST]}>
              <SpecialistProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
