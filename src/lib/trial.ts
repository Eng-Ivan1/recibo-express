const TRIAL_KEY = "reciboja:trial-start";

/** "vip" = versão paga (sem bloqueio). Standard = trava de 3 dias (72h). */
export const EDITION = (import.meta.env.VITE_APP_EDITION as string | undefined) ?? "standard";

export const IS_VIP = EDITION === "vip";

/** Dias de acesso: 3 dias (72h) na versão normal, 30 dias na versão VIP. */
export const TRIAL_DAYS = IS_VIP ? 30 : 3;

/** Na versão VIP o bloqueio está desativado por completo. */
export const TRIAL_DISABLED = IS_VIP;

export const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

export function getTrialStart(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = window.localStorage.getItem(TRIAL_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const now = Date.now();
  window.localStorage.setItem(TRIAL_KEY, String(now));
  return now;
}

export function trialMsLeft(): number {
  if (TRIAL_DISABLED) return Number.POSITIVE_INFINITY;
  return getTrialStart() + TRIAL_MS - Date.now();
}

export function isTrialExpired(): boolean {
  return trialMsLeft() <= 0;
}

export const ESCALEPAY_URL = "https://escalepay.com";

/** Ciclo de subscrição VIP: 30 dias a contar do primeiro acesso. */
export const CICLO_DIAS = 30;

/** Dias que faltam para o fim do ciclo de 30 dias (VIP). */
export function diasParaRenovacao(): number {
  const fim = getTrialStart() + CICLO_DIAS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((fim - Date.now()) / 86_400_000));
}

/** Mostra aviso quando faltam 5 dias ou menos. */
export function precisaAvisoRenovacao(): boolean {
  return IS_VIP && diasParaRenovacao() <= 5;
}
