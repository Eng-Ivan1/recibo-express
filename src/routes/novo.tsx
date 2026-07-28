import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gerarPdf } from "@/lib/pdf";
import {
  moeda,
  uid,
  useCatalogo,
  useDocumentos,
  usePerfil,
  type DocItem,
  type DocStatus,
  type DocType,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/novo")({
  head: () => ({
    meta: [
      { title: "Novo documento | ReciboJá" },
      {
        name: "description",
        content:
          "Preencha os dados do cliente, adicione itens e gere um recibo ou orçamento em PDF.",
      },
      { property: "og:title", content: "Novo documento | ReciboJá" },
      {
        property: "og:description",
        content: "Gerador dinâmico de recibos e orçamentos com cálculo automático de totais.",
      },
    ],
  }),
  component: Novo,
});

function Novo() {
  const navigate = useNavigate();
  const { adicionar } = useDocumentos();
  const { catalogo } = useCatalogo();
  const { perfil, guardarPerfil } = usePerfil();

  const [tipo, setTipo] = useState<DocType>("recibo");
  const [status, setStatus] = useState<DocStatus>("pago");
  const [cliente, setCliente] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<DocItem[]>([
    { id: uid(), nome: "", quantidade: 1, preco: 0 },
  ]);

  const total = itens.reduce((s, i) => s + (i.quantidade || 0) * (i.preco || 0), 0);

  const atualizarItem = (id: string, patch: Partial<DocItem>) =>
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const adicionarDoCatalogo = (catId: string) => {
    const item = catalogo.find((c) => c.id === catId);
    if (!item) return;
    setItens((prev) => [
      ...prev.filter((i) => i.nome.trim() !== "" || i.preco > 0),
      { id: uid(), nome: item.nome, quantidade: 1, preco: item.preco },
    ]);
  };

  const submeter = () => {
    const validos = itens.filter((i) => i.nome.trim() !== "");
    if (!cliente.trim()) return toast.error("Indique o nome do cliente.");
    if (validos.length === 0) return toast.error("Adicione pelo menos um item.");

    const doc = adicionar({
      tipo,
      status: tipo === "orcamento" ? "pendente" : status,
      cliente: cliente.trim(),
      clienteContacto: clienteContacto.trim(),
      observacoes: observacoes.trim(),
      itens: validos,
      total: validos.reduce((s, i) => s + i.quantidade * i.preco, 0),
    });

    gerarPdf(doc, perfil);
    toast.success("PDF gerado com sucesso!");
    navigate({ to: "/historico" });
  };

  return (
    <AppLayout title="Novo documento" subtitle="Preencha, calcule e gere o PDF.">
      <div className="space-y-4">
        <div className="surface-card p-5">
          <Label className="text-xs text-muted-foreground">Tipo de documento</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["recibo", "orcamento"] as DocType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                  tipo === t
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-secondary text-secondary-foreground",
                )}
              >
                {t === "recibo" ? "Recibo" : "Orçamento"}
              </button>
            ))}
          </div>

          {tipo === "recibo" ? (
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Estado do pagamento</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["pago", "pendente"] as DocStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                      status === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {s === "pago" ? "Pago" : "Pendente"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="text-sm font-bold">Os seus dados</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="empresa">Nome / Empresa</Label>
              <Input
                id="empresa"
                value={perfil.empresa}
                onChange={(e) => guardarPerfil({ ...perfil, empresa: e.target.value })}
                placeholder="Ex.: João Silva Serviços"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contacto">Contacto / NIF</Label>
              <Input
                id="contacto"
                value={perfil.contacto}
                onChange={(e) => guardarPerfil({ ...perfil, contacto: e.target.value })}
                placeholder="912 345 678 · NIF 123456789"
              />
            </div>
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <h2 className="text-sm font-bold">Dados do cliente</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cliente">Nome do cliente</Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ex.: Maria Santos"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clienteContacto">Contacto (opcional)</Label>
              <Input
                id="clienteContacto"
                value={clienteContacto}
                onChange={(e) => setClienteContacto(e.target.value)}
                placeholder="Email ou telemóvel"
              />
            </div>
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Itens</h2>
            {catalogo.length > 0 ? (
              <Select value="" onValueChange={adicionarDoCatalogo}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Do catálogo" />
                </SelectTrigger>
                <SelectContent>
                  {catalogo.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} — {moeda(c.preco)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="size-3.5" /> Catálogo vazio
              </span>
            )}
          </div>

          <div className="space-y-3">
            {itens.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-secondary/50 p-3">
                <Input
                  value={item.nome}
                  onChange={(e) => atualizarItem(item.id, { nome: e.target.value })}
                  placeholder="Descrição do produto ou serviço"
                  className="bg-card"
                />
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-[11px] text-muted-foreground">Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(item.id, { quantidade: Number(e.target.value) })
                      }
                      className="bg-card"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[11px] text-muted-foreground">Preço (€)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={item.preco}
                      onChange={(e) => atualizarItem(item.id, { preco: Number(e.target.value) })}
                      className="bg-card"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <Label className="text-[11px] text-muted-foreground">Subtotal</Label>
                    <p className="pt-2 text-sm font-bold">
                      {moeda((item.quantidade || 0) * (item.preco || 0))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5 text-muted-foreground hover:text-destructive"
                    onClick={() => setItens((prev) => prev.filter((i) => i.id !== item.id))}
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setItens((prev) => [...prev, { id: uid(), nome: "", quantidade: 1, preco: 0 }])
            }
          >
            <Plus className="size-4" /> Adicionar item
          </Button>

          <div className="space-y-1.5">
            <Label htmlFor="obs">Observações (opcional)</Label>
            <Textarea
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Condições de pagamento, prazos, garantias…"
            />
          </div>
        </div>

        <div className="surface-card flex items-center justify-between p-5">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-2xl font-extrabold">{moeda(total)}</span>
        </div>

        <Button
          size="lg"
          className="h-14 w-full rounded-2xl text-base font-bold shadow-float"
          onClick={submeter}
        >
          <Download className="size-5" /> Gerar PDF profissional
        </Button>
      </div>
    </AppLayout>
  );
}
