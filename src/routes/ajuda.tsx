import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ListOrdered, Smartphone } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda e Guia Rápido | BusiGest" },
      {
        name: "description",
        content:
          "Guia completo do BusiGest: porque precisa de orçamentos profissionais, os benefícios reais e o passo a passo para emitir e guardar o PDF no telemóvel.",
      },
      { property: "og:title", content: "Ajuda e Guia Rápido | BusiGest" },
      {
        property: "og:description",
        content: "Manual bilingue do BusiGest: dores, benefícios e passo a passo funcional.",
      },
    ],
  }),
  component: Ajuda,
});

const conteudo = {
  pt: {
    title: "Ajuda",
    subtitle: "O guia rápido para transformar o seu negócio em 30 segundos.",
    dorTitulo: "A motivação: porque está a perder dinheiro sem saber",
    dor: [
      "O cliente pede o preço no WhatsApp e você demora horas a responder — quando responde, ele já comprou noutro sítio.",
      "Manda cotações escritas em texto puro, cheias de erros, com aspeto amador. Quem parece amador cobra barato.",
      "Não sabe de cor o preço nem o valor real do que tem em stock, e acaba a vender abaixo do que vale.",
      "No fim do mês não sabe quanto recebeu, quanto está por receber nem quem lhe deve dinheiro.",
    ],
    benTitulo: "Os benefícios: porque o BusiGest é a solução",
    ben: [
      "Profissionaliza o seu negócio em 30 segundos: envia um PDF com o seu nome, logo azul e dados de pagamento.",
      "Gera autoridade imediata — quem apresenta documentos sérios fecha mais contratos e cobra mais caro.",
      "Roda direto no telemóvel, instala-se como aplicativo e quase não ocupa memória.",
      "100% seguro e prático: os seus dados ficam guardados no seu próprio dispositivo, sem contas nem palavras-passe.",
      "Catálogo inteligente: guarde os preços uma vez e emita documentos com dois toques para sempre.",
    ],
    passosTitulo: "Passo a passo funcional",
    passos: [
      "1. Definições — escolha o país (Moçambique, Brasil ou África do Sul), a moeda e preencha os seus dados: nome/empresa, contacto e formas de pagamento (M-Pesa, e-Mola, PIX, banco, IBAN ou link).",
      "2. Catálogo — registe os produtos e serviços que mais vende com o preço certo. Faça isto uma vez e nunca mais digite preços à mão.",
      "3. Criar — escolha Recibo ou Orçamento, indique o cliente, adicione itens do catálogo (o total é calculado sozinho) e toque em Gerar PDF profissional.",
      "4. Histórico — acompanhe tudo. Um toque muda de Pendente para Pago, e o botão Enviar Cobrança WhatsApp manda uma mensagem de cobrança educada e formatada.",
    ],
    pdfTitulo: "Como guardar o PDF real no telemóvel",
    pdf: [
      "iPhone (Safari): ao gerar o documento, ele abre no ecrã. Toque no ícone Partilhar (quadrado com seta para cima) e escolha 'Guardar em Ficheiros' — ou 'Partilhar > WhatsApp' para enviar direto ao cliente.",
      "Android (Chrome): o PDF é descarregado automaticamente para a pasta Transferências/Downloads. Abra o WhatsApp, toque no clipe e escolha Documento para enviar.",
      "Instalar o app: no Chrome do PC clique no ícone de instalar na barra de endereço; no iPhone use 'Partilhar > Adicionar ao Ecrã Principal'. O BusiGest passa a abrir em ecrã inteiro, sem barras.",
    ],
  },
  en: {
    title: "Guide",
    subtitle: "The quick guide to professionalise your business in 30 seconds.",
    dorTitulo: "The motivation: why you are losing money without noticing",
    dor: [
      "A client asks for a price on WhatsApp and you take hours to reply — by then they have already bought elsewhere.",
      "You send quotations as plain text, full of typos and amateur looking. Whoever looks amateur charges low prices.",
      "You don't remember your prices or the real value of your stock, so you end up selling below what it is worth.",
      "At month end you have no idea how much you earned, how much is outstanding or who still owes you.",
    ],
    benTitulo: "The benefits: why BusiGest is the answer",
    ben: [
      "Professionalises your business in 30 seconds: send a PDF with your name, blue branding and payment details.",
      "Creates instant authority — people who present serious documents close more deals and charge more.",
      "Runs straight on your phone, installs like a real app and takes almost no storage.",
      "100% safe and practical: your data stays on your own device, with no accounts or passwords.",
      "Smart catalog: save your prices once and issue documents in two taps forever.",
    ],
    passosTitulo: "Functional step by step",
    passos: [
      "1. Settings — choose your country (Mozambique, Brazil or South Africa), the currency and fill in your details: name/company, contact and payment methods (bank details, branch, Tax ID, IBAN or payment link).",
      "2. Catalog — save the products and services you sell most with the right price. Do it once and never type a price again.",
      "3. Create — pick Invoice or Quotation, enter the client, add catalog items (the total is calculated automatically) and tap Generate professional PDF.",
      "4. History — track everything. One tap switches Pending to Paid, and the Send WhatsApp Reminder button sends a polite, well formatted payment request.",
    ],
    pdfTitulo: "How to save the real PDF on your phone",
    pdf: [
      "iPhone (Safari): the document opens on screen. Tap the Share icon (square with an up arrow) and choose 'Save to Files' — or 'Share > WhatsApp' to send it straight to the client.",
      "Android (Chrome): the PDF downloads automatically to your Downloads folder. Open WhatsApp, tap the clip and choose Document to send it.",
      "Install the app: on desktop Chrome click the install icon in the address bar; on iPhone use 'Share > Add to Home Screen'. BusiGest then opens full screen, with no browser bars.",
    ],
  },
} as const;

function Bloco({
  icon: Icon,
  titulo,
  linhas,
  destaque,
}: {
  icon: typeof CheckCircle2;
  titulo: string;
  linhas: readonly string[];
  destaque?: boolean;
}) {
  return (
    <section className="surface-card space-y-3 p-5">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <Icon className={destaque ? "size-5 text-accent" : "size-5 text-primary"} />
        {titulo}
      </h2>
      <ul className="space-y-2.5">
        {linhas.map((l) => (
          <li key={l} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Ajuda() {
  const { lang } = useI18n();
  const c = conteudo[lang === "en" ? "en" : "pt"];

  return (
    <AppLayout title={c.title} subtitle={c.subtitle}>
      <div className="space-y-4">
        <Bloco icon={AlertTriangle} titulo={c.dorTitulo} linhas={c.dor} />
        <Bloco icon={CheckCircle2} titulo={c.benTitulo} linhas={c.ben} destaque />
        <Bloco icon={ListOrdered} titulo={c.passosTitulo} linhas={c.passos} />
        <Bloco icon={Smartphone} titulo={c.pdfTitulo} linhas={c.pdf} />
      </div>
    </AppLayout>
  );
}
