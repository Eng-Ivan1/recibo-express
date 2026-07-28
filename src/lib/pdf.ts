import { jsPDF } from "jspdf";
import { dataCurta, moeda, type Documento, type Perfil } from "./store";

const NAVY: [number, number, number] = [15, 33, 66];
const SLATE: [number, number, number] = [100, 116, 139];

export function gerarPdf(doc: Documento, perfil: Perfil) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const M = 48;

  // Cabeçalho
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, W, 110, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text(perfil.empresa || "ReciboJá", M, 52);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  if (perfil.contacto) pdf.text(perfil.contacto, M, 70);

  const titulo = doc.tipo === "recibo" ? "RECIBO" : "ORÇAMENTO";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(titulo, W - M, 52, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Nº ${String(doc.numero).padStart(4, "0")}`, W - M, 70, { align: "right" });
  pdf.text(dataCurta(doc.criadoEm), W - M, 85, { align: "right" });

  // Cliente
  let y = 155;
  pdf.setTextColor(...SLATE);
  pdf.setFontSize(9);
  pdf.text("CLIENTE", M, y);
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

  // Tabela
  y += 35;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(M, y - 14, W - M * 2, 24, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...NAVY);
  pdf.text("DESCRIÇÃO", M + 10, y + 2);
  pdf.text("QTD", W - M - 190, y + 2, { align: "right" });
  pdf.text("PREÇO", W - M - 105, y + 2, { align: "right" });
  pdf.text("TOTAL", W - M - 10, y + 2, { align: "right" });

  y += 30;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(10);
  doc.itens.forEach((item) => {
    if (y > 720) {
      pdf.addPage();
      y = 80;
    }
    pdf.text(String(item.nome).slice(0, 48), M + 10, y);
    pdf.text(String(item.quantidade), W - M - 190, y, { align: "right" });
    pdf.text(moeda(item.preco), W - M - 105, y, { align: "right" });
    pdf.text(moeda(item.preco * item.quantidade), W - M - 10, y, { align: "right" });
    y += 12;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(M, y, W - M, y);
    y += 18;
  });

  // Total
  y += 6;
  pdf.setFillColor(...NAVY);
  pdf.rect(W - M - 240, y, 240, 40, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("TOTAL", W - M - 228, y + 24);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(moeda(doc.total), W - M - 12, y + 25, { align: "right" });

  y += 70;
  if (doc.observacoes) {
    pdf.setTextColor(...SLATE);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Observações:", M, y);
    pdf.setTextColor(60, 60, 60);
    pdf.text(pdf.splitTextToSize(doc.observacoes, W - M * 2), M, y + 14);
  }

  pdf.setTextColor(...SLATE);
  pdf.setFontSize(8);
  pdf.text(
    doc.tipo === "recibo"
      ? "Documento emitido eletronicamente. Obrigado pela preferência."
      : "Orçamento válido por 30 dias a contar da data de emissão.",
    M,
    800,
  );

  pdf.save(`${titulo.toLowerCase()}-${String(doc.numero).padStart(4, "0")}.pdf`);
}
