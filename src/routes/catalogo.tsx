import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCatalogo } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo | ReciboJá" },
      {
        name: "description",
        content:
          "Guarde os seus produtos e serviços mais vendidos com preço e reutilize-os nos recibos.",
      },
      { property: "og:title", content: "Catálogo | ReciboJá" },
      {
        property: "og:description",
        content: "Mini-stock de produtos e serviços para criar recibos mais depressa.",
      },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const { catalogo, adicionar, remover } = useCatalogo();
  const { t, fmt, currency } = useI18n();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  const guardar = () => {
    if (!nome.trim()) return toast.error(t("cat.errName"));
    adicionar(nome.trim(), Number(preco) || 0);
    setNome("");
    setPreco("");
    toast.success(t("cat.okSaved"));
  };

  return (
    <AppLayout title={t("cat.title")} subtitle={t("cat.subtitle")}>
      <div className="surface-card space-y-3 p-5">
        <h2 className="text-sm font-bold">{t("cat.addNew")}</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="nome">{t("common.name")}</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t("cat.namePh")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preco">
              {t("common.price")} ({currency})
            </Label>
            <Input
              id="preco"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <Button className="md:mt-6" onClick={guardar}>
            <Plus className="size-4" /> {t("common.save")}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-bold">
          {t("cat.saved")} <span className="text-muted-foreground">({catalogo.length})</span>
        </h2>
        {catalogo.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-2 p-10 text-center">
            <Package className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("cat.empty")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {catalogo.map((item) => (
              <li key={item.id} className="surface-card flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.nome}</p>
                  <p className="text-sm text-muted-foreground">{fmt(item.preco)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remover(item.id)}
                  aria-label={`${t("common.remove")} ${item.nome}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
