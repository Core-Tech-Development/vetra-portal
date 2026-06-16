import i18next from "i18next";

export const ROLES = {
  CLINIC_ADMIN: "CLINIC_ADMIN",
  CLINIC_STAFF: "CLINIC_STAFF",
  SPECIALIST: "SPECIALIST",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_OPERATOR: "PLATFORM_OPERATOR",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

const KNOWN_ROLES = new Set<string>(Object.values(ROLES));

export function filterAppRoles(roles: string[]): UserRole[] {
  return roles.filter((r) => KNOWN_ROLES.has(r)) as UserRole[];
}

export function getRoleLabel(role: string): string {
  return i18next.t(`common:roles.${role}`, { defaultValue: role });
}
