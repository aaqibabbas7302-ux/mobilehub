import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { sendInvoiceEmail } from "@/lib/email";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.customer_email) {
      return NextResponse.json(
        { error: "Customer email is required to send invoice" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      order_number: order.order_number,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      phone_name: order.phone_name,
      phone_brand: order.phone_brand,
      phone_variant: order.phone_variant,
      phone_imei: order.phone_imei,
      amount: order.amount || order.final_amount,
      discount: order.discount || 0,
      final_amount: order.final_amount,
      payment_method: order.payment_method,
      sale_channel: order.sale_channel,
      notes: order.notes,
    });

    // Send email
    await sendInvoiceEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      amount: formatCurrency(order.final_amount),
      pdfBuffer,
    });

    // Update order with invoice sent timestamp
    await supabase
      .from("orders")
      .update({ invoice_sent_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${order.customer_email}`,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    
    // Check for Resend API key error
    if (error instanceof Error && error.message.includes("RESEND_API_KEY")) {
      return NextResponse.json(
        { error: "Email service not configured. Please set RESEND_API_KEY environment variable." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
