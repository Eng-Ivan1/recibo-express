import { jsPDF } from "jspdf";
import { dataCurta, moeda, type Documento, type Lang, type Perfil } from "./store";

const NAVY: [number, number, number] = [15, 33, 66];
const SLATE: [number, number, number] = [100, 116, 139];

const L = {
  pt: {
    receipt: "RECIBO",
    quote: "ORÇAMENTO",
    client: "CLIENTE",
    desc: "DESCRIÇÃO",
    qty: "QTD",
    price: "PREÇO",
    lineTotal: "TOTAL",
    total: "TOTAL A PAGAR",
    notes: "Observações:",
    payment: "Dados de pagamento:",
    footerReceipt: "Documento emitido eletronicamente. Obrigado pela preferência.",
    footerQuote: "Orçamento válido por 30 dias a contar da data de emissão.",
    no: "Nº",
    paid: "PAGO",
    pending: "PENDENTE",
  },
  en: {
    receipt: "INVOICE",
    quote: "QUOTATION",
    client: "CLIENT",
    desc: "DESCRIPTION",
    qty: "QTY",
    price: "PRICE",
    lineTotal: "TOTAL",
    total: "TOTAL DUE",
    notes: "Notes:",
    payment: "Payment details:",
    footerReceipt: "Electronically issued document. Thank you for your business.",
    footerQuote: "Valid for 30 days from the issue date.",
    no: "No.",
    paid: "PAID",
    pending: "PENDING",
  },
} as const;

export function gerarPdf(
  doc: Documento,
  perfil: Perfil,
  opts: { lang: Lang; currency: string } = { lang: "pt", currency: "MZN" },
) {
  const { lang, currency } = opts;
  const s = L[lang] ?? L.pt;
  const fmt = (v: number) => moeda(v, currency, lang);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const M = 48;

  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, W, 110, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text(perfil.empresa || "BusiGest", M, 52);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  if (perfil.contacto) pdf.text(perfil.contacto, M, 70);
  if (perfil.nuit) pdf.text(`NUIT: ${perfil.nuit}`, M, 85);

  const titulo = doc.tipo === "recibo" ? s.receipt : s.quote;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(titulo, W - M, 52, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`${s.no} ${String(doc.numero).padStart(4, "0")}`, W - M, 70, { align: "right" });
  pdf.text(dataCurta(doc.criadoEm, lang), W - M, 85, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.text(doc.status === "pago" ? s.paid : s.pending, W - M, 100, { align: "right" });

  let y = 155;
  pdf.setTextColor(...SLATE);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(s.client, M, y);
  pdf.setTextColor(20, 20, 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  y += 18;
  pdf.text(doc.cliente || "—", M, y);
  if (doc.clienteContacto) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    y += 15;
    pdf.text(doc.clienteContacto, M, y);
  }

  y += 35;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(M, y - 14, W - M * 2, 24, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...NAVY);
  pdf.text(s.desc, M + 10, y + 2);
  pdf.text(s.qty, W - M - 190, y + 2, { align: "right" });
  pdf.text(s.price, W - M - 105, y + 2, { align: "right" });
  pdf.text(s.lineTotal, W - M - 10, y + 2, { align: "right" });

  y += 30;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(10);
  doc.itens.forEach((item) => {
    if (y > 700) {
      pdf.addPage();
      y = 80;
    }
    pdf.text(String(item.nome).slice(0, 48), M + 10, y);
    pdf.text(String(item.quantidade), W - M - 190, y, { align: "right" });
    pdf.text(fmt(item.preco), W - M - 105, y, { align: "right" });
    pdf.text(fmt(item.preco * item.quantidade), W - M - 10, y, { align: "right" });
    y += 12;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(M, y, W - M, y);
    y += 18;
  });

  y += 6;
  pdf.setFillColor(...NAVY);
  pdf.rect(W - M - 260, y, 260, 40, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(s.total, W - M - 248, y + 24);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(fmt(doc.total), W - M - 12, y + 25, { align: "right" });

  y += 70;
  if (doc.observacoes) {
    pdf.setTextColor(...SLATE);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(s.notes, M, y);
    pdf.setTextColor(60, 60, 60);
    const linhas = pdf.splitTextToSize(doc.observacoes, W - M * 2) as string[];
    pdf.text(linhas, M, y + 14);
    y += 14 + linhas.length * 12 + 12;
  }

  const pagamento = [
    perfil.mpesa ? `M-Pesa: ${perfil.mpesa}` : "",
    perfil.emola ? `e-Mola: ${perfil.emola}` : "",
    perfil.banco || perfil.conta
      ? `${perfil.banco}${perfil.banco && perfil.conta ? " · " : ""}${perfil.conta}`
      : "",
    perfil.iban ? `IBAN: ${perfil.iban}` : "",
    perfil.swift ? `SWIFT/BIC: ${perfil.swift}` : "",
    perfil.linkPagamento
      ? `${lang === "en" ? "Pay online" : "Pagar online"}: ${perfil.linkPagamento}`
      : "",
  ].filter(Boolean);

  if (pagamento.length > 0) {
    if (y > 690) {
      pdf.addPage();
      y = 80;
    }
    pdf.setTextColor(...SLATE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(s.payment, M, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pagamento.forEach((linha, i) => pdf.text(linha, M, y + 14 + i * 12));
  }

  pdf.setTextColor(...SLATE);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(doc.tipo === "recibo" ? s.footerReceipt : s.footerQuote, M, 800);

  pdf.save(`${titulo.toLowerCase()}-${String(doc.numero).padStart(4, "0")}.pdf`);
}
