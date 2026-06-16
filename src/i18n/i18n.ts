import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// PT-BR
import commonPtBR from "./locales/pt-BR/common.json";
import authPtBR from "./locales/pt-BR/auth.json";
import dashboardPtBR from "./locales/pt-BR/dashboard.json";
import patientsPtBR from "./locales/pt-BR/patients.json";
import tutorsPtBR from "./locales/pt-BR/tutors.json";
import staffPtBR from "./locales/pt-BR/staff.json";
import examRequestsPtBR from "./locales/pt-BR/examRequests.json";
import appointmentsPtBR from "./locales/pt-BR/appointments.json";
import laudosPtBR from "./locales/pt-BR/laudos.json";
import schedulePtBR from "./locales/pt-BR/schedule.json";
import clinicsPtBR from "./locales/pt-BR/clinics.json";
import specialistsPtBR from "./locales/pt-BR/specialists.json";
import billingPtBR from "./locales/pt-BR/billing.json";
import adminPtBR from "./locales/pt-BR/admin.json";
import notificationsPtBR from "./locales/pt-BR/notifications.json";

// EN
import commonEn from "./locales/en/common.json";
import authEn from "./locales/en/auth.json";
import dashboardEn from "./locales/en/dashboard.json";
import patientsEn from "./locales/en/patients.json";
import tutorsEn from "./locales/en/tutors.json";
import staffEn from "./locales/en/staff.json";
import examRequestsEn from "./locales/en/examRequests.json";
import appointmentsEn from "./locales/en/appointments.json";
import laudosEn from "./locales/en/laudos.json";
import scheduleEn from "./locales/en/schedule.json";
import clinicsEn from "./locales/en/clinics.json";
import specialistsEn from "./locales/en/specialists.json";
import billingEn from "./locales/en/billing.json";
import adminEn from "./locales/en/admin.json";
import notificationsEn from "./locales/en/notifications.json";

const resources = {
  "pt-BR": {
    common: commonPtBR,
    auth: authPtBR,
    dashboard: dashboardPtBR,
    patients: patientsPtBR,
    tutors: tutorsPtBR,
    staff: staffPtBR,
    examRequests: examRequestsPtBR,
    appointments: appointmentsPtBR,
    laudos: laudosPtBR,
    schedule: schedulePtBR,
    clinics: clinicsPtBR,
    specialists: specialistsPtBR,
    billing: billingPtBR,
    admin: adminPtBR,
    notifications: notificationsPtBR,
  },
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    patients: patientsEn,
    tutors: tutorsEn,
    staff: staffEn,
    examRequests: examRequestsEn,
    appointments: appointmentsEn,
    laudos: laudosEn,
    schedule: scheduleEn,
    clinics: clinicsEn,
    specialists: specialistsEn,
    billing: billingEn,
    admin: adminEn,
    notifications: notificationsEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pt-BR",
    defaultNS: "common",
    ns: [
      "common",
      "auth",
      "dashboard",
      "patients",
      "tutors",
      "staff",
      "examRequests",
      "appointments",
      "laudos",
      "schedule",
      "clinics",
      "specialists",
      "billing",
      "admin",
      "notifications",
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "vetra_language",
      caches: ["localStorage"],
    },
  });

export default i18n;
