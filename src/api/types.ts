export interface CreateClinicRequest {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export interface ClinicResponse {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  status: number;
  title: string;
  detail: string;
  timestamp: string;
}

// === Specialist ===
export interface CreateSpecialistRequest {
  name: string;
  email: string;
  phone?: string;
  crmv: string;
  crmvState: string;
  specialty: string;
  baseCity?: string;
  baseState?: string;
  maxTravelRadiusKm?: number;
  hasOwnEquipment: boolean;
  bio?: string;
}

export interface UpdateSpecialistRequest {
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  baseCity?: string;
  baseState?: string;
  maxTravelRadiusKm?: number;
  hasOwnEquipment: boolean;
  bio?: string;
}

export interface SpecialistResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  crmv: string;
  crmvState: string;
  specialty: string;
  baseCity: string | null;
  baseState: string | null;
  maxTravelRadiusKm: number | null;
  hasOwnEquipment: boolean;
  bio: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddCoverageAreaRequest {
  city: string;
  state: string;
  radiusKm?: number;
}

export interface CoverageAreaResponse {
  id: string;
  specialistId: string;
  city: string;
  state: string;
  radiusKm: number | null;
  active: boolean;
  createdAt: string;
}

export interface UpdateMyProfileRequest {
  name: string;
  phone?: string;
  baseCity?: string;
  baseState?: string;
  maxTravelRadiusKm?: number;
  hasOwnEquipment: boolean;
  bio?: string;
}

// === Tutor ===
export interface CreateTutorRequest {
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface TutorResponse {
  id: string;
  clinicId: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Patient ===
export interface CreatePatientRequest {
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  birthDate?: string;
  weightKg?: number;
  neutered?: boolean;
  microchip?: string;
  clinicalNotes?: string;
}

export interface UpdatePatientRequest extends CreatePatientRequest {}

export interface PatientResponse {
  id: string;
  clinicId: string;
  tutorId: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  weightKg: number | null;
  neutered: boolean | null;
  microchip: string | null;
  clinicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Exam Request ===
export interface CreateExamRequestRequest {
  patientId: string;
  examType: string;
  priority?: string;
  diagnosticHypothesis?: string;
  clinicalHistory?: string;
  additionalNotes?: string;
}

export interface ExamRequestResponse {
  id: string;
  clinicId: string;
  patientId: string;
  examType: string;
  priority: string;
  diagnosticHypothesis: string | null;
  clinicalHistory: string | null;
  additionalNotes: string | null;
  status: string;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentId?: string | null;
  appointmentStatus?: string | null;
}

// === Availability Slot ===
export interface CreateSlotRequest {
  startAt: string;
  endAt: string;
  label?: string;
}

export interface SlotResponse {
  id: string;
  specialistId: string;
  startAt: string;
  endAt: string;
  status: string;
  label: string | null;
  recurrenceGroupId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkSlotsRequest {
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  label?: string;
  timezone: string;
}

// === Appointment ===
export interface CreateAppointmentRequest {
  examRequestId: string;
  specialistId: string;
  availabilitySlotId: string;
}

export interface AppointmentResponse {
  id: string;
  examRequestId: string;
  specialistId: string;
  availabilitySlotId: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  status: string;
  cancelReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Exam File ===
export interface ExamFileResponse {
  id: string;
  appointmentId: string;
  fileName: string;
  fileType: string;
  contentType: string;
  storageKey: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
  downloadUrl?: string;
}

// === Laudo ===
export interface CreateLaudoRequest {
  findings?: string;
  conclusion?: string;
  recommendations?: string;
}

export interface UpdateLaudoRequest extends CreateLaudoRequest {}

export interface LaudoResponse {
  id: string;
  appointmentId: string;
  specialistId: string;
  status: string;
  findings: string | null;
  conclusion: string | null;
  recommendations: string | null;
  pdfStorageKey: string | null;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Appointment Note ===
export interface AppointmentNoteResponse {
  id: string;
  appointmentId: string;
  authorUserId: string;
  title: string;
  content: string;
  createdAt: string;
}

// === Audit ===
export interface AuditLogResponse {
  id: string;
  actorUserId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

// === Notification ===
export interface NotificationResponse {
  id: string;
  recipientUserId: string;
  channel: string;
  type: string;
  status: string;
  subject: string | null;
  payload: string | null;
  referenceId: string | null;
  referenceType: string | null;
  read: boolean;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

// === Clinic Staff ===
export interface CreateClinicStaffRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
}

export interface UpdateClinicStaffRequest {
  name: string;
  phone?: string;
  role: string;
}

export interface ClinicStaffResponse {
  id: string;
  clinicId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// === Admin Dashboard ===
export interface AdminDashboardResponse {
  totalClinics: number;
  totalSpecialists: number;
  pendingClinicApprovals: number;
  pendingSpecialistApprovals: number;
  totalAppointmentsToday: number;
  totalActiveAppointments: number;
}

// === Billing ===
export interface ExamTypePricingResponse {
  id: string;
  examType: string;
  priceCents: number;
  platformFeePercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamTypePricingRequest {
  examType: string;
  priceCents: number;
  platformFeePercent: number;
}

export interface UpdateExamTypePricingRequest {
  priceCents: number;
  platformFeePercent: number;
  active: boolean;
}

export interface CreateSpecialistPricingRequest {
  examType: string;
  priceCents: number;
}

export interface SpecialistPricingResponse {
  id: string;
  specialistId: string;
  examType: string;
  priceCents: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecordResponse {
  id: string;
  laudoId: string;
  appointmentId: string;
  clinicId: string;
  specialistId: string;
  examType: string;
  totalCents: number;
  platformFeeCents: number;
  specialistShareCents: number;
  status: string;
  asaasPaymentId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingDashboardResponse {
  totalRevenueCents: number;
  totalPlatformFeeCents: number;
  pendingPayments: number;
  overduePayments: number;
  totalBillingRecords: number;
}
