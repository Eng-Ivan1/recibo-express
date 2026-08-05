import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ESCALEPAY_URL, diasParaRenovacao, precisaAvisoRenovacao } from "@/lib/trial";

export function RenewalBanner() {
  const { lang, t } = useI18n();
  const [dias, setDias] = useState<number | null>(null);

  useEffect(() => {
    if (!precisaAvisoRenovacao()) return;
    setDias(diasParaRenovacao());
  }, []);

  if (dias === null) return null;

  const texto =
    lang === "en"
      ? `Warning: Your BusiGest subscription ends in ${dias} days. Please renew to avoid service interruption.`
      : `Aviso: A sua subscrição BusiGest termina em ${dias} dias. Regularize o pagamento para evitar a suspensão.`;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/50 bg-warning/10 px-4 py-3">
      <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
      <p className="min-w-0 flex-1 text-sm font-medium text-warning-foreground">{texto}</p>
      <a
        href={ESCALEPAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center justify-center rounded-xl bg-accent px-4 text-xs font-bold text-accent-foreground"
      >
        {t("banner.cta")}
      </a>
    </div>
  );
}
