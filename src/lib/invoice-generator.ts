import jsPDF from "jspdf";

interface OrderData {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  phone_name: string;
  phone_brand: string;
  phone_variant: string | null;
  phone_imei: string | null;
  amount: number;
  discount: number;
  final_amount: number;
  payment_method: string | null;
  sale_channel: string | null;
  notes: string | null;
}

export function generateInvoicePDF(order: OrderData): Uint8Array {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor = "#f97316"; // Orange
  const textColor = "#1f2937";
  const grayColor = "#6b7280";
  
  // Header - Company Info
  doc.setFillColor(249, 115, 22); // Orange header bar
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MobileHub Delhi", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Second-Hand Mobiles", 20, 28);
  
  // Invoice label on right
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, 20, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(order.order_number, pageWidth - 20, 28, { align: "right" });
  
  // Reset text color
  doc.setTextColor(31, 41, 55);
  
  // Invoice Details Box
  let yPos = 50;
  
  doc.setFillColor(249, 250, 251); // Light gray bg
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 30, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Invoice Date", 20, yPos + 3);
  doc.text("Payment Method", 80, yPos + 3);
  doc.text("Sale Channel", 140, yPos + 3);
  
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  doc.text(invoiceDate, 20, yPos + 12);
  doc.text(order.payment_method?.toUpperCase() || "CASH", 80, yPos + 12);
  doc.text(order.sale_channel || "Store", 140, yPos + 12);
  
  // Customer Details
  yPos = 95;
  doc.setFillColor(255, 247, 237); // Orange tint bg
  doc.roundedRect(15, yPos - 5, (pageWidth - 40) / 2, 40, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(249, 115, 22);
  doc.text("BILL TO", 20, yPos + 3);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.text(order.customer_name, 20, yPos + 14);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Phone: ${order.customer_phone}`, 20, yPos + 23);
  if (order.customer_email) {
    doc.text(`Email: ${order.customer_email}`, 20, yPos + 31);
  }
  
  // Company Address
  const rightBoxX = 20 + (pageWidth - 40) / 2 + 10;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(rightBoxX, yPos - 5, (pageWidth - 40) / 2, 40, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 114, 128);
  doc.text("FROM", rightBoxX + 5, yPos + 3);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.text("MobileHub Delhi", rightBoxX + 5, yPos + 14);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Laxmi Nagar, Delhi 110092", rightBoxX + 5, yPos + 23);
  doc.text("Phone: +91 99107 24940", rightBoxX + 5, yPos + 31);
  
  // Items Table Header
  yPos = 150;
  doc.setFillColor(31, 41, 55);
  doc.roundedRect(15, yPos, pageWidth - 30, 12, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM DESCRIPTION", 20, yPos + 8);
  doc.text("QTY", 130, yPos + 8);
  doc.text("AMOUNT", pageWidth - 20, yPos + 8, { align: "right" });
  
  // Item Row
  yPos += 20;
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(order.phone_name, 20, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  
  let itemDetails = [];
  if (order.phone_brand) itemDetails.push(`Brand: ${order.phone_brand}`);
  if (order.phone_variant) itemDetails.push(`Storage: ${order.phone_variant}`);
  if (order.phone_imei) itemDetails.push(`IMEI: ${order.phone_imei}`);
  
  if (itemDetails.length > 0) {
    doc.text(itemDetails.join(" | "), 20, yPos + 7);
  }
  
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("1", 130, yPos);
  doc.text(formatCurrency(order.amount), pageWidth - 20, yPos, { align: "right" });
  
  // Divider
  yPos += 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  // Totals
  yPos += 15;
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Subtotal:", totalsX, yPos);
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(order.amount), pageWidth - 20, yPos, { align: "right" });
  
  if (order.discount > 0) {
    yPos += 10;
    doc.setTextColor(220, 38, 38); // Red for discount
    doc.text("Discount:", totalsX, yPos);
    doc.text(`-${formatCurrency(order.discount)}`, pageWidth - 20, yPos, { align: "right" });
  }
  
  // Total
  yPos += 15;
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(totalsX - 10, yPos - 7, pageWidth - totalsX + 5, 14, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL:", totalsX, yPos + 2);
  doc.text(formatCurrency(order.final_amount), pageWidth - 20, yPos + 2, { align: "right" });
  
  // Notes
  if (order.notes) {
    yPos += 30;
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notes:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.notes, 20, yPos + 8);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(229, 231, 235);
  doc.line(15, footerY - 10, pageWidth - 15, footerY - 10);
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for shopping with MobileHub Delhi!", pageWidth / 2, footerY, { align: "center" });
  doc.text("For queries, contact us at +91 99107 24940 or visit our store.", pageWidth / 2, footerY + 7, { align: "center" });
  
  // Terms
  doc.setFontSize(8);
  doc.text("* All products come with 7-day replacement warranty", pageWidth / 2, footerY + 16, { align: "center" });
  
  // Return as Uint8Array
  return doc.output("arraybuffer") as unknown as Uint8Array;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
