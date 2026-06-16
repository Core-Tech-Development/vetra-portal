import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ROUTE_BREADCRUMB_KEYS: Record<string, string> = {
  "": "breadcrumbs.dashboard",
  "patients": "breadcrumbs.patients",
  "new": "breadcrumbs.new",
  "edit": "breadcrumbs.edit",
  "tutors": "breadcrumbs.tutors",
  "staff": "breadcrumbs.staff",
  "exam-requests": "breadcrumbs.examRequests",
  "appointments": "breadcrumbs.appointments",
  "laudos": "breadcrumbs.laudos",
  "schedule": "breadcrumbs.schedule",
  "profile": "breadcrumbs.profile",
  "clinics": "breadcrumbs.clinics",
  "specialists": "breadcrumbs.specialists",
  "admin": "breadcrumbs.admin",
  "approvals": "breadcrumbs.approvals",
  "audit": "breadcrumbs.auditLog",
  "billing": "breadcrumbs.billing",
  "pricing": "breadcrumbs.pricing",
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const { t } = useTranslation("common");
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: t("breadcrumbs.dashboard") }];
  }

  const items: BreadcrumbItem[] = [
    { label: t("breadcrumbs.dashboard"), href: "/" },
  ];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += "/" + segment;
    const isLast = i === segments.length - 1;

    // Check if segment is a UUID (detail page) — skip label
    const isUuid = /^[0-9a-f]{8}-/.test(segment);
    const breadcrumbKey = ROUTE_BREADCRUMB_KEYS[segment];
    const label = isUuid
      ? t("breadcrumbs.details")
      : breadcrumbKey
        ? t(breadcrumbKey)
        : segment;

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}
