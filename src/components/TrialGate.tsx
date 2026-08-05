import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ESCALEPAY_URL, IS_VIP, TRIAL_DAYS, TRIAL_DISABLED, isTrialExpired, trialMsLeft } from "@/lib/trial";

import { ESCALEPAY_URL } from "@/lib/trial";

export function TrialGate({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (TRIAL_DISABLED) return;
    const check = () => setBloqueado(isTrialExpired());
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (TRIAL_DISABLED || !bloqueado) return <>{children}</>;

  const pt = lang !== "en";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-5">
      <div className="surface-card w-full max-w-md space-y-4 p-7 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Lock className="size-7" />
        </span>
        <h1 className="text-xl font-extrabold tracking-tight">
          {pt ? "Período de teste terminado" : "Trial period ended"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {pt
            ? `As suas ${TRIAL_DAYS * 24} horas gratuitas de utilização do BusiGest expiraram. Para continuar a criar recibos e orçamentos, ative a sua licença através da EscalePay.`
            : `Your ${TRIAL_DAYS * 24} free hours of BusiGest have expired. To keep creating receipts and quotations, activate your licence through EscalePay.`}
        </p>
        <a
          href={ESCALEPAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-accent text-base font-bold text-accent-foreground shadow-float"
        >
          {pt ? "Ativar com a EscalePay" : "Activate with EscalePay"}
        </a>
        <p className="text-xs text-muted-foreground">
          {pt
            ? "Já é cliente? Aceda à versão BusiGest VIP com o seu acesso pago."
            : "Already a customer? Use BusiGest VIP with your paid access."}
        </p>
      </div>
    </div>
  );
}

export function useTrialDaysLeft() {
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    if (TRIAL_DISABLED) return;
    setDias(Math.max(0, Math.ceil(trialMsLeft() / 86_400_000)));
  }, []);
  return IS_VIP ? null : dias;
}
