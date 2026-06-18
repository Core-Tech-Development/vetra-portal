/**
 * Granular staleTime configuration for TanStack Query.
 * Controls how long data is considered "fresh" before refetching.
 */
export const STALE_TIMES = {
  /** Pricing data, coverage areas — rarely changes */
  static: 5 * 60 * 1000, // 5 minutes

  /** User profiles, clinic/specialist details — changes occasionally */
  profile: 3 * 60 * 1000, // 3 minutes

  /** Lists (clinics, specialists, patients, etc.) — moderate freshness */
  list: 60 * 1000, // 1 minute

  /** Dashboard stats, appointment counts — needs to be fairly fresh */
  dashboard: 30 * 1000, // 30 seconds (current default)

  /** Notifications, real-time data — needs to be very fresh */
  realtime: 15 * 1000, // 15 seconds
} as const;
