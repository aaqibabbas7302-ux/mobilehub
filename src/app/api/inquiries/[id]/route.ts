import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET single inquiry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      }
      throw error;
    }

    // If there's a phone_id, fetch phone details
    let phone = null;
    if (inquiry.phone_id) {
      const { data: phoneData } = await supabase
        .from("phones")
        .select("id, brand, model_name, variant, selling_price_paise, images")
        .eq("id", inquiry.phone_id)
        .single();
      
      if (phoneData) {
        phone = {
          ...phoneData,
          selling_price: phoneData.selling_price_paise / 100,
        };
      }
    }

    return NextResponse.json({ inquiry, phone });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update inquiry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { 
      status, 
      priority,
      assigned_to,
      notes,
      interested_in,
      converted_order_id
    } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (notes !== undefined) updateData.notes = notes;
    if (interested_in !== undefined) updateData.interested_in = interested_in;
    if (converted_order_id !== undefined) updateData.converted_order_id = converted_order_id;

    const { data, error } = await supabase
      .from("inquiries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inquiry:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inquiry: data, message: "Inquiry updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/inquiries/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting inquiry:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/inquiries/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
