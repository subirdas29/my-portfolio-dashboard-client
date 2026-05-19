"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { TOrder } from "@/types/order";
import { format } from "date-fns";

export default function InvoiceGenerator({ order }: { order: TOrder }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const clientName =
        typeof order.clientId === "object" && order.clientId !== null
          ? (order.clientId as { name: string; email: string }).name
          : "Client";
      const clientEmail =
        typeof order.clientId === "object" && order.clientId !== null
          ? (order.clientId as { name: string; email: string }).email
          : "";

      const invoiceNo = `INV-${order._id.slice(-6).toUpperCase()}`;
      const issueDate = format(new Date(), "dd MMM yyyy");
      const dueDate = order.deadline
        ? format(new Date(order.deadline), "dd MMM yyyy")
        : "On completion";

      // ── Header ──────────────────────────────────────────────────
      doc.setFillColor(99, 102, 241); // indigo-500
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Subir Das — Full Stack Developer", 14, 28);
      doc.text("subirdas.vercel.app", 14, 34);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(invoiceNo, 196, 20, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Issue: ${issueDate}`, 196, 27, { align: "right" });
      doc.text(`Due: ${dueDate}`, 196, 33, { align: "right" });

      // ── Bill To ─────────────────────────────────────────────────
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO", 14, 52);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(clientName, 14, 59);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(clientEmail, 14, 65);

      // ── Order Details ────────────────────────────────────────────
      doc.setFillColor(245, 245, 250);
      doc.rect(14, 75, 182, 10, "F");
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DESCRIPTION", 17, 81.5);
      doc.text("QTY", 140, 81.5);
      doc.text("AMOUNT", 183, 81.5, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.text(order.title, 17, 93);
      if (order.description) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(order.description, 110);
        doc.text(lines.slice(0, 2), 17, 99);
      }
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text("1", 140, 93);
      doc.text(
        `${order.currency} ${(order.budget ?? 0).toLocaleString()}`,
        183,
        93,
        { align: "right" },
      );

      // ── Milestones ───────────────────────────────────────────────
      if (order.milestones.length > 0) {
        let y = 115;
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "bold");
        doc.text("MILESTONES", 17, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        order.milestones.slice(0, 8).forEach((m) => {
          doc.setTextColor(m.done ? 16 : 100, m.done ? 185 : 100, m.done ? 129 : 100);
          doc.text(`${m.done ? "✓" : "○"} ${m.title}`, 17, y);
          y += 5;
        });
      }

      // ── Totals ───────────────────────────────────────────────────
      const totalsY = 200;
      doc.setDrawColor(200, 200, 210);
      doc.line(14, totalsY - 5, 196, totalsY - 5);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.text("Subtotal", 140, totalsY);
      doc.text(
        `${order.currency} ${(order.budget ?? 0).toLocaleString()}`,
        196,
        totalsY,
        { align: "right" },
      );

      doc.text("Paid", 140, totalsY + 7);
      doc.setTextColor(16, 185, 129);
      doc.text(
        `${order.currency} ${order.paidAmount.toLocaleString()}`,
        196,
        totalsY + 7,
        { align: "right" },
      );

      const due = (order.budget ?? 0) - order.paidAmount;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(due > 0 ? 239 : 16, due > 0 ? 68 : 185, due > 0 ? 68 : 129);
      doc.text("Balance Due", 140, totalsY + 17);
      doc.text(
        `${order.currency} ${due.toLocaleString()}`,
        196,
        totalsY + 17,
        { align: "right" },
      );

      // ── Footer ───────────────────────────────────────────────────
      doc.setFillColor(245, 245, 250);
      doc.rect(0, 270, 210, 27, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you for your business!", 105, 280, { align: "center" });
      doc.text("subirdas.vercel.app · codealign.co@gmail.com", 105, 286, { align: "center" });

      doc.save(`${invoiceNo}-${clientName.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={generating}
      variant="outline"
      size="sm"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {generating ? "Generating..." : "Download Invoice PDF"}
    </Button>
  );
}
