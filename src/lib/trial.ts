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
