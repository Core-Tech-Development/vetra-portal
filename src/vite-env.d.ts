/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
}

// Altcha web component type declarations
declare namespace JSX {
  interface IntrinsicElements {
    "altcha-widget": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        challengeurl?: string;
        challengejson?: string;
        hidefooter?: boolean;
        hidelogo?: boolean;
        auto?: string;
        delay?: number;
        expire?: number;
        maxnumber?: number;
        name?: string;
        strings?: string;
      },
      HTMLElement
    >;
  }
}
