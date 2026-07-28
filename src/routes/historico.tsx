import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gerarPdf } from "@/lib/pdf";
import { dataCurta, moeda, useDocumentos, usePerfil } from "@/lib/store";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico | ReciboJá" },
      {
        name: "description",
        content:
          "Consulte todos os recibos e orçamentos emitidos, com estado pago ou pendente e download do PDF.",
      },
      { property: "og:title", content: "Histórico | ReciboJá" },
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

  return (
    <AppLayout title="Histórico" subtitle="Todos os documentos que já emitiu.">
      {documentos.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <FileText className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Ainda não há documentos emitidos.</p>
          <Button asChild>
            <Link to="/novo">Criar o primeiro</Link>
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
                      {d.tipo === "recibo" ? "Recibo" : "Orçamento"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Nº {String(d.numero).padStart(4, "0")} · {dataCurta(d.criadoEm)} ·{" "}
                    {d.itens.length} {d.itens.length === 1 ? "item" : "itens"}
                  </p>
                </div>
                <p className="text-lg font-extrabold">{moeda(d.total)}</p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alternarStatus(d.id)}
                  className={
                    d.status === "pago"
                      ? "rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                      : "rounded-full border border-warning/50 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-foreground"
                  }
                >
                  {d.status === "pago" ? "Pago" : "Pendente"}
                </button>
                <span className="text-[11px] text-muted-foreground">toque para alterar</span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => gerarPdf(d, perfil)}
                    aria-label="Descarregar PDF"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remover(d.id)}
                    aria-label="Eliminar documento"
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
