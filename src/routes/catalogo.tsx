import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moeda, useCatalogo } from "@/lib/store";

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
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  const guardar = () => {
    if (!nome.trim()) return toast.error("Indique o nome do produto ou serviço.");
    adicionar(nome.trim(), Number(preco) || 0);
    setNome("");
    setPreco("");
    toast.success("Guardado no catálogo.");
  };

  return (
    <AppLayout title="Catálogo" subtitle="Os seus produtos e serviços sempre à mão.">
      <div className="surface-card space-y-3 p-5">
        <h2 className="text-sm font-bold">Adicionar novo</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Corte de cabelo"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preco">Preço (€)</Label>
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
            <Plus className="size-4" /> Guardar
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-bold">
          Guardados <span className="text-muted-foreground">({catalogo.length})</span>
        </h2>
        {catalogo.length === 0 ? (
          <div className="surface-card flex flex-col items-center gap-2 p-10 text-center">
            <Package className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ainda não guardou nada. Adicione os seus itens mais vendidos.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {catalogo.map((item) => (
              <li key={item.id} className="surface-card flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.nome}</p>
                  <p className="text-sm text-muted-foreground">{moeda(item.preco)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remover(item.id)}
                  aria-label={`Remover ${item.nome}`}
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
