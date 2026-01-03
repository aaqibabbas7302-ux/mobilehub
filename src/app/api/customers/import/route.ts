import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { customers } = body;

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: "Invalid data. Expected an array of customers." }, { status: 400 });
    }

    // Validate and format data
    const validCustomers = customers.map((c: any) => ({
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      status: c.status || "active",
      city: c.city || null,
      whatsapp_number: c.whatsapp_number || c.phone, // Default whatsapp to phone if not provided
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })).filter(c => c.name && c.phone);

    if (validCustomers.length === 0) {
      return NextResponse.json({ error: "No valid customers found in data." }, { status: 400 });
    }

    // Perform bulk insert
    const { data, error } = await supabase
      .from("customers")
      .insert(validCustomers)
      .select();

    if (error) {
      console.error("Error importing customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: data.length,
      message: `Successfully imported ${data.length} customers` 
    });

  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
