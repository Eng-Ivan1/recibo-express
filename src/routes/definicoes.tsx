import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Globe, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOEDAS, usePerfil, type Lang } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/definicoes")({
  head: () => ({
    meta: [
      { title: "Definições | Gestão Fácil" },
      {
        name: "description",
        content:
          "Configure idioma, moeda e os dados de pagamento do emissor: M-Pesa, e-Mola, banco local, IBAN, SWIFT e link de pagamento.",
      },
      { property: "og:title", content: "Definições | Gestão Fácil" },
      {
        property: "og:description",
        content: "Idioma, moeda e dados de pagamento nacionais e internacionais.",
      },
    ],
  }),
  component: Definicoes,
});

function Definicoes() {
  const { perfil, guardarPerfil } = usePerfil();
  const { t, lang, setLang, currency, setCurrency } = useI18n();

  const campo = (
    id: keyof typeof perfil,
    label: string,
    placeholder?: string,
    type: "text" | "url" = "text",
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={perfil[id]}
        onChange={(e) => guardarPerfil({ ...perfil, [id]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <AppLayout title={t("set.title")} subtitle={t("set.subtitle")}>
      <div className="space-y-4">
        <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("set.language")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { code: "pt", label: "Português (PT)" },
                  { code: "en", label: "English (EN)" },
                ] as { code: Lang; label: string }[]
              ).map((o) => (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => setLang(o.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                    lang === o.code
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-secondary text-secondary-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("set.currency")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOEDAS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="text-sm font-bold">{t("set.issuer")}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {campo("empresa", t("novo.company"), "Ex.: João Silva Serviços")}
            {campo("contacto", t("novo.contact"), "84 123 4567")}
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Smartphone className="size-4 text-accent" /> {t("set.mobileWallets")}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {campo("mpesa", t("set.mpesa"), "84 123 4567")}
            {campo("emola", t("set.emola"), "86 123 4567")}
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Banknote className="size-4 text-accent" /> {t("set.localBank")}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {campo("banco", t("set.bank"), "Ex.: BCI, Millennium bim")}
            {campo("conta", t("set.account"), "0003 0000 0000 0000 0000 0")}
            {campo("nuit", t("set.nuit"), "123456789")}
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Globe className="size-4 text-accent" /> {t("set.international")}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {campo("iban", t("set.iban"), "MZ59 0000 0000 0000 0000 0000 0")}
            {campo("swift", t("set.swift"), "BCOMMZMX")}
          </div>
          {campo("linkPagamento", t("set.payLink"), "https://paypal.me/…", "url")}
        </div>

        <Button
          size="lg"
          className="h-14 w-full rounded-2xl text-base font-bold shadow-float"
          onClick={() => toast.success(t("set.saved"))}
        >
          {t("common.save")}
        </Button>
      </div>
    </AppLayout>
  );
}
