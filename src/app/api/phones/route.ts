import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all phones
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("phones")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (brand) {
      query = query.eq("brand", brand);
    }
    
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching phones:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ phones: data, count });
  } catch (error) {
    console.error("Error in GET /api/phones:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new phone
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      brand,
      model,
      price,
      originalPrice,
      cost,
      storage,
      color,
      condition,
      imei,
      batteryHealth,
      description,
      quantity,
      images,
    } = body;

    // Validate required fields
    if (!name || !brand || !price || !imei) {
      return NextResponse.json(
        { error: "Name, brand, price, and IMEI are required" },
        { status: 400 }
      );
    }

    // Map condition to grade
    const conditionGradeMap: Record<string, string> = {
      like_new: "A+",
      excellent: "A",
      very_good: "B+",
      good: "B+",
      fair: "B",
    };

    // Parse storage to get variant
    const variant = storage || null;

    // Use rupee values directly (no paise conversion)
    const sellingPrice = parseFloat(price);
    const originalMrp = originalPrice ? parseFloat(originalPrice) : null;
    const costPrice = cost ? parseFloat(cost) : sellingPrice;

    const phoneData = {
      brand,
      model_name: name,
      model_number: model || null,
      variant,
      color: color || null,
      imei_1: imei,
      condition_grade: conditionGradeMap[condition] || condition || "B",
      battery_health_percent: batteryHealth ? parseInt(batteryHealth) : null,
      cost_price: costPrice,
      selling_price: sellingPrice,
      original_mrp: originalMrp,
      images: images || [],
      thumbnail_url: images?.[0] || null,
      status: "Available",
      location: "Store",
      description: description || null,
    };

    const { data, error } = await supabase
      .from("phones")
      .insert([phoneData])
      .select()
      .single();

    if (error) {
      console.error("Error creating phone:", error);
      
      // Check for unique constraint violation (duplicate IMEI)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A phone with this IMEI already exists" },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ phone: data, message: "Phone added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/phones:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
