import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get customer details for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const supabase = await createClient();
    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);
    
    // Get customer info
    const normalizedPhone = decodedPhone.replace(/[^0-9]/g, "").slice(-10);
    
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .or(`phone.eq.${normalizedPhone},phone.eq.+91${normalizedPhone},phone.eq.91${normalizedPhone}`)
      .single();

    // Get their inquiries
    const { data: inquiries } = await supabase
      .from("inquiries")
      .select("*")
      .ilike("customer_phone", `%${normalizedPhone}%`)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get their orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", normalizedPhone)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      customer,
      inquiries: inquiries || [],
      orders: orders || [],
      phone: decodedPhone
    });
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update customer status from conversation view
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const supabase = await createClient();
    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);
    const body = await request.json();

    const normalizedPhone = decodedPhone.replace(/[^0-9]/g, "").slice(-10);

    // Update customer
    const { data: customer, error } = await supabase
      .from("customers")
      .update({
        name: body.name,
        email: body.email,
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .or(`phone.eq.${normalizedPhone},phone.eq.+91${normalizedPhone},phone.eq.91${normalizedPhone}`)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
