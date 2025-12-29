import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }
      throw error;
    }

    // Fetch customer's orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ 
      customer: {
        ...customer,
        total_spent: customer.total_spent_paise / 100,
      },
      orders: orders?.map(o => ({
        ...o,
        amount: o.amount_paise / 100,
        final_amount: o.final_amount_paise / 100,
      })) || []
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { name, email, phone, whatsapp_number, address, city, status, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (whatsapp_number !== undefined) updateData.whatsapp_number = whatsapp_number;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer: data, message: "Customer updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/customers/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting customer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/customers/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
