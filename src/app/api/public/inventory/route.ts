import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple API Key for demonstration. In production, use process.env.API_KEY
const API_KEY = "mobilehub-public-api-key";

export async function POST(request: NextRequest) {
  try {
    // Check API Key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized. Invalid API Key." }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["brand", "model_name", "selling_price", "condition", "storage"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const phoneData = {
      brand: body.brand,
      model_name: body.model_name,
      selling_price: body.selling_price,
      original_price: body.original_price || body.selling_price,
      condition: body.condition, // A+, A, B, C
      storage: body.storage,
      color: body.color || "Standard",
      status: body.status || "Available",
      description: body.description || "",
      images: body.images || [],
      imei: body.imei || null,
      battery_health: body.battery_health || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("phones")
      .insert(phoneData)
      .select()
      .single();

    if (error) {
      console.error("Error adding inventory via API:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      phone: data,
      message: "Inventory added successfully" 
    });

  } catch (error) {
    console.error("Error in public inventory API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
