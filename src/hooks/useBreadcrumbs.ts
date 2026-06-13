import { useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  "patients": "Patients",
  "new": "New",
  "edit": "Edit",
  "tutors": "Tutors",
  "staff": "Staff",
  "exam-requests": "Exam Requests",
  "appointments": "Appointments",
  "laudos": "Laudos",
  "schedule": "Schedule",
  "profile": "Profile",
  "clinics": "Clinics",
  "specialists": "Specialists",
  "admin": "Admin",
  "approvals": "Approvals",
  "audit": "Audit Log",
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard" }];
  }

  const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += "/" + segment;
    const isLast = i === segments.length - 1;

    // Check if segment is a UUID (detail page) — skip label
    const isUuid = /^[0-9a-f]{8}-/.test(segment);
    const label = isUuid ? "Details" : (ROUTE_LABELS[segment] ?? segment);

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return items;
}
