import i18n from "i18next";

function getLocale(): string {
  const lang = i18n.language;
  if (lang === "pt-BR") return "pt-BR";
  return "en-US";
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(cents: number): string {
  const locale = getLocale();
  const currency = locale === "pt-BR" ? "BRL" : "BRL";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
