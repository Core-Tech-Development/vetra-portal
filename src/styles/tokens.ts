/**
 * Vetra Design Tokens — TypeScript constants
 *
 * IMPORTANT: The primary source of truth for design tokens is the CSS custom
 * properties defined in tokens.css. This file mirrors those values for
 * programmatic use in TypeScript/JSX (e.g., the Spinner component).
 *
 * When updating tokens, always update tokens.css FIRST, then sync this file.
 */

export const colors = {
  background: "#F7FAF8",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF5F1",
  border: "#D7E3DC",

  textPrimary: "#17211B",
  textSecondary: "#4F6257",

  primary: "#1F6F5B",
  primaryHover: "#185746",
  accent: "#7CA982",

  success: "#2E7D32",
  warning: "#B7791F",
  danger: "#B42318",
  dangerHover: "#921D14",
  info: "#2563EB",
} as const;

export const typography = {
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(23, 33, 27, 0.06)",
  md: "0 4px 6px rgba(23, 33, 27, 0.07), 0 2px 4px rgba(23, 33, 27, 0.06)",
  lg: "0 10px 15px rgba(23, 33, 27, 0.08), 0 4px 6px rgba(23, 33, 27, 0.05)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const motion = {
  fast: "120ms",
  normal: "180ms",
  slow: "240ms",
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const;
