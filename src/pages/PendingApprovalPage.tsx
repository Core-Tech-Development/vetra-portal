import { useAuth } from "../auth/useAuth";
import { Button } from "../components/ui";
import styles from "./PendingApprovalPage.module.css";

function ClockIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" stroke="#D7E3DC" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" fill="#EEF5F1" />
      <path
        d="M32 20v14l8 4"
        stroke="#1F6F5B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SuspendedIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" stroke="#D7E3DC" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" fill="#FEF2F2" />
      <path
        d="M24 24l16 16M40 24L24 40"
        stroke="#B42318"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PendingApprovalPageProps {
  status: string;
}

export function PendingApprovalPage({ status }: PendingApprovalPageProps) {
  const { logout } = useAuth();

  const isSuspended = status === "SUSPENDED";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoPlaceholder}>
          <img src="/logo.png" alt="Vetra" className={styles.logoImg} />
        </div>

        <div className={styles.icon}>
          {isSuspended ? <SuspendedIcon /> : <ClockIcon />}
        </div>

        <h1 className={styles.title}>
          {isSuspended ? "Conta suspensa" : "Cadastro em analise"}
        </h1>

        <p className={styles.message}>
          {isSuspended
            ? "Sua conta foi suspensa. Entre em contato com o suporte para mais informacoes."
            : "Seu cadastro esta sendo analisado pela equipe Vetra. Voce recebera uma notificacao quando sua conta for aprovada."}
        </p>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={logout}
          className={styles.logoutButton}
        >
          Sair
        </Button>

        <div className={styles.divider} />
        <p className={styles.footer}>Vetra - Diagnostico por imagem veterinario</p>
      </div>
    </div>
  );
}
