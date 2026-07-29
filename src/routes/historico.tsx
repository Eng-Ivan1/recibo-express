import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, MessageCircle, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { gerarPdf } from "@/lib/pdf";
import { moeda, useDocumentos, usePerfil, type Documento } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico | EasyGest" },
      {
        name: "description",
        content:
          "Consulte todos os recibos e orçamentos emitidos, com estado pago ou pendente e download do PDF.",
      },
      { property: "og:title", content: "Histórico | EasyGest" },
      {
        property: "og:description",
        content: "Lista completa dos seus documentos com estado de pagamento.",
      },
    ],
  }),
  component: Historico,
});

function Historico() {
  const { documentos, alternarStatus, remover } = useDocumentos();
  const { perfil } = usePerfil();
  const { t, fmt, data, lang, currency } = useI18n();

  const mensagemCobranca = (d: Documento) => {
    const numero = String(d.numero).padStart(4, "0");
    const valor = moeda(d.total, currency, lang);
    const emissor = perfil.empresa || "EasyGest";
    const tipo = d.tipo === "recibo" ? t("common.receipt") : t("common.quote");
    const pagamento = [
      perfil.mpesa ? `M-Pesa: ${perfil.mpesa}` : "",
      perfil.emola ? `e-Mola: ${perfil.emola}` : "",
      perfil.banco || perfil.conta ? `${perfil.banco} ${perfil.conta}`.trim() : "",
      perfil.iban ? `IBAN: ${perfil.iban}` : "",
      perfil.swift ? `SWIFT/BIC: ${perfil.swift}` : "",
      perfil.linkPagamento || "",
    ]
      .filter(Boolean)
      .join("\n");

    if (lang === "en") {
      return (
        `Hello ${d.cliente},\n\n` +
        `We hope you are well. This is a friendly reminder regarding ${tipo} No. ${numero}, ` +
        `dated ${data(d.criadoEm)}, with a total amount due of ${valor}.\n\n` +
        (pagamento ? `Payment details:\n${pagamento}\n\n` : "") +
        `Whenever convenient, please confirm the payment. Thank you for your business.\n\n` +
        `Kind regards,\n${emissor}`
      );
    }
    return (
      `Olá ${d.cliente},\n\n` +
      `Esperamos que esteja tudo bem. Enviamos um lembrete cordial referente ao ${tipo.toLowerCase()} nº ${numero}, ` +
      `emitido a ${data(d.criadoEm)}, no valor total de ${valor}.\n\n` +
      (pagamento ? `Dados para pagamento:\n${pagamento}\n\n` : "") +
      `Assim que lhe for possível, agradecemos a confirmação do pagamento. Obrigado pela preferência.\n\n` +
      `Com os melhores cumprimentos,\n${emissor}`
    );
  };

  // Um orçamento marcado como pago é exportado automaticamente como recibo/invoice,
  // reaproveitando todos os dados originais (sem prazo de validade de 30 dias).
  const baixarPdf = (d: Documento) =>
    gerarPdf(d.status === "pago" ? { ...d, tipo: "recibo" } : d, perfil, { lang, currency });

  const enviarWhatsapp = (d: Documento) => {
    const telefone = (d.clienteContacto || "").replace(/[^0-9]/g, "");
    const texto = encodeURIComponent(mensagemCobranca(d));
    if (!telefone) toast.info(t("hist.noPhone"));
    const url = telefone
      ? `https://wa.me/${telefone}?text=${texto}`
      : `https://wa.me/?text=${texto}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout title={t("hist.title")} subtitle={t("hist.subtitle")}>
      {documentos.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <FileText className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("hist.empty")}</p>
          <Button asChild>
            <Link to="/novo">{t("hist.first")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {documentos.map((d) => (
            <li key={d.id} className="surface-card p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{d.cliente}</p>
                    <Badge variant="secondary" className="font-medium">
                      {d.tipo === "recibo" ? t("common.receipt") : t("common.quote")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lang === "en" ? "No." : "Nº"} {String(d.numero).padStart(4, "0")} ·{" "}
                    {data(d.criadoEm)} · {d.itens.length}{" "}
                    {d.itens.length === 1 ? t("common.item") : t("common.items")}
                  </p>
                </div>
                <p className="text-lg font-extrabold">{fmt(d.total)}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => alternarStatus(d.id)}
                  className={
                    d.status === "pago"
                      ? "rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                      : "rounded-full border border-warning/50 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-foreground"
                  }
                >
                  {d.status === "pago" ? t("common.paid") : t("common.pending")}
                </button>
                <span className="text-[11px] text-muted-foreground">{t("hist.tapToChange")}</span>
                <div className="ml-auto flex items-center gap-1">
                  {d.status === "pago" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-success/40 text-success hover:bg-success/10"
                      onClick={() => baixarPdf(d)}
                    >
                      <Download className="size-4" /> {t("hist.downloadReceipt")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-success/40 text-success hover:bg-success/10"
                      onClick={() => enviarWhatsapp(d)}
                    >
                      <MessageCircle className="size-4" /> {t("hist.whatsapp")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => baixarPdf(d)}
                    aria-label={t("hist.downloadPdf")}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remover(d.id)}
                    aria-label={t("hist.delete")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
