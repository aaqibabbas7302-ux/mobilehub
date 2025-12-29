import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ 
      order: {
        ...order,
        amount: order.amount,
        discount: order.discount,
        final_amount: order.final_amount,
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update order
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
      payment_status, 
      payment_method,
      tracking_number,
      shipping_address,
      shipping_city,
      shipping_pincode,
      notes 
    } = body;

    // Get current order to check phone_id
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("phone_id, status")
      .eq("id", id)
      .single();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (shipping_address !== undefined) updateData.shipping_address = shipping_address;
    if (shipping_city !== undefined) updateData.shipping_city = shipping_city;
    if (shipping_pincode !== undefined) updateData.shipping_pincode = shipping_pincode;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update phone status based on order status
    if (currentOrder?.phone_id && status) {
      let phoneStatus = "Reserved";
      if (status === "completed" || status === "delivered") {
        phoneStatus = "Sold";
      } else if (status === "cancelled" || status === "refunded") {
        phoneStatus = "Available";
      }
      
      await supabase
        .from("phones")
        .update({ status: phoneStatus })
        .eq("id", currentOrder.phone_id);
    }

    return NextResponse.json({ 
      order: {
        ...data,
        amount: data.amount,
        discount: data.discount,
        final_amount: data.final_amount,
      }, 
      message: "Order updated successfully" 
    });
  } catch (error) {
    console.error("Error in PUT /api/orders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get order to check phone_id
    const { data: order } = await supabase
      .from("orders")
      .select("phone_id")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Make phone available again
    if (order?.phone_id) {
      await supabase
        .from("phones")
        .update({ status: "Available" })
        .eq("id", order.phone_id);
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/orders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
