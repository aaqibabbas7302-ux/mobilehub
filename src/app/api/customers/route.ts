import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all customers with stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: customers, error, count } = await query;

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats
    const allCustomers = await supabase.from("customers").select("status, total_spent_paise");
    const customersData = allCustomers.data || [];
    
    const stats = {
      total: customersData.length,
      vip: customersData.filter(c => c.status === "vip").length,
      active: customersData.filter(c => c.status === "active").length,
      new: customersData.filter(c => c.status === "new").length,
      avgOrderValue: customersData.length > 0 
        ? Math.round(customersData.reduce((acc, c) => acc + (c.total_spent_paise || 0), 0) / customersData.length / 100)
        : 0,
    };

    return NextResponse.json({ 
      customers: customers?.map(c => ({
        ...c,
        total_spent: c.total_spent_paise / 100,
      })),
      count,
      stats
    });
  } catch (error) {
    console.error("Error in GET /api/customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, email, phone, whatsapp_number, address, city, status, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const customerData = {
      name,
      email: email || null,
      phone,
      whatsapp_number: whatsapp_number || phone,
      address: address || null,
      city: city || "Delhi",
      status: status || "new",
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer: data, message: "Customer created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
