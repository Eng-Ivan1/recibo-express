import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Plus, TrendingUp, Wallet } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RenewalBanner } from "@/components/RenewalBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentos } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel | BusiGest" },
      {
        name: "description",
        content:
          "Veja quanto faturou no mês, quantos recibos emitiu e crie um novo documento num toque.",
      },
      { property: "og:title", content: "Painel | BusiGest" },
      {
        property: "og:description",
        content: "Resumo de faturação e criação rápida de recibos e orçamentos.",
      },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { documentos } = useDocumentos();
  const { t, fmt, data } = useI18n();
  const agora = new Date();
  const doMes = documentos.filter((d) => {
    const dt = new Date(d.criadoEm);
    return dt.getMonth() === agora.getMonth() && dt.getFullYear() === agora.getFullYear();
  });

  // Qualquer documento marcado como "pago" conta para a faturação do mês.
  const ganhoMes = doMes.filter((d) => d.status === "pago").reduce((s, d) => s + d.total, 0);
  const pendente = documentos
    .filter((d) => d.status === "pendente")
    .reduce((s, d) => s + d.total, 0);
  const recibosMes = doMes.filter((d) => d.tipo === "recibo").length;

  const cards = [
    { label: t("dash.earned"), valor: fmt(ganhoMes), icon: Wallet, destaque: true },
    { label: t("dash.receipts"), valor: String(recibosMes), icon: FileText },
    { label: t("dash.toReceive"), valor: fmt(pendente), icon: TrendingUp },
  ];

  return (
    <AppLayout title={t("dash.title")} subtitle={t("dash.subtitle")}>
      <RenewalBanner />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={c.destaque ? "surface-card col-span-2 p-5 md:col-span-1" : "surface-card p-5"}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <c.icon className="size-4" />
              <span className="text-xs font-medium">{c.label}</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{c.valor}</p>
          </div>
        ))}
      </section>

      <Button
        asChild
        size="lg"
        className="mt-5 h-16 w-full rounded-2xl text-base font-bold shadow-float"
      >
        <Link to="/novo">
          <Plus className="size-5" />
          {t("dash.cta")}
        </Link>
      </Button>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">{t("dash.latest")}</h2>
          <Link to="/historico" className="flex items-center gap-1 text-sm font-medium text-accent">
            {t("dash.seeAll")} <ArrowRight className="size-4" />
          </Link>
        </div>

        {documentos.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("dash.empty")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {documentos.slice(0, 5).map((d) => (
              <li key={d.id} className="surface-card flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.cliente || t("dash.noName")}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.tipo === "recibo" ? t("common.receipt") : t("common.quote")} nº
                    {String(d.numero).padStart(4, "0")} · {data(d.criadoEm)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fmt(d.total)}</p>
                  <Badge
                    variant="outline"
                    className={
                      d.status === "pago"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-warning/50 bg-warning/10 text-warning-foreground"
                    }
                  >
                    {d.status === "pago" ? t("common.paid") : t("common.pending")}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppLayout>
  );
}
