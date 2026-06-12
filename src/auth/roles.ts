export const ROLES = {
  CLINIC_ADMIN: "CLINIC_ADMIN",
  CLINIC_STAFF: "CLINIC_STAFF",
  SPECIALIST: "SPECIALIST",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_OPERATOR: "PLATFORM_OPERATOR",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

const ROLE_LABELS: Record<string, string> = {
  [ROLES.PLATFORM_ADMIN]: "Admin Vetra",
  [ROLES.PLATFORM_OPERATOR]: "Operador Vetra",
  [ROLES.CLINIC_ADMIN]: "Admin Clínica",
  [ROLES.CLINIC_STAFF]: "Equipe Clínica",
  [ROLES.SPECIALIST]: "Especialista",
};

const KNOWN_ROLES = new Set<string>(Object.values(ROLES));

export function filterAppRoles(roles: string[]): UserRole[] {
  return roles.filter((r) => KNOWN_ROLES.has(r)) as UserRole[];
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
