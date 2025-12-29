import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function formatPrice(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

const conditionLabels: Record<string, string> = {
  "A+": "Like New",
  "A": "Excellent",
  "B+": "Very Good",
  "B": "Good",
  "C": "Fair",
  "D": "Acceptable",
};

// GET single phone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: phone, error } = await supabase
      .from("phones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
      }
      throw error;
    }

    // Use rupee values directly (no paise conversion)
    const sellingPrice = phone.selling_price;
    const originalPrice = phone.original_mrp || null;
    const costPrice = phone.cost_price;
    
    // Calculate discount
    const discount = originalPrice && originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

    const condition = conditionLabels[phone.condition_grade] || phone.condition_grade;

    const response = {
      success: true,
      data: {
        id: phone.id,
        brand: phone.brand,
        model_name: phone.model_name,
        model_number: phone.model_number,
        variant: phone.variant,
        color: phone.color,
        condition_grade: phone.condition_grade,
        condition: condition,
        battery_health_percent: phone.battery_health_percent,
        selling_price: sellingPrice,
        selling_price_formatted: formatPrice(sellingPrice),
        original_price: originalPrice,
        original_price_formatted: originalPrice ? formatPrice(originalPrice) : null,
        cost_price: costPrice,
        discount: discount,
        discount_formatted: `${discount}%`,
        images: phone.images || [],
        thumbnail_url: phone.thumbnail_url,
        status: phone.status,
        warranty_type: phone.warranty_type,
        imei_1: phone.imei_1,
        description: phone.description,
        accessories_included: phone.accessories_included || [],
        created_at: phone.created_at,
        // WhatsApp-friendly detailed text
        whatsappText: `📱 *${phone.brand} ${phone.model_name}*\n\n` +
          `💾 Storage: ${phone.variant || 'N/A'}\n` +
          `🎨 Color: ${phone.color || 'N/A'}\n` +
          `⭐ Condition: ${condition}\n` +
          `🔋 Battery: ${phone.battery_health_percent || 'N/A'}%\n` +
          `📦 Accessories: ${(phone.accessories_included || []).join(', ') || 'Phone Only'}\n\n` +
          `💰 Price: *${formatPrice(sellingPrice)}*\n` +
          (originalPrice ? `🏷️ MRP: ${formatPrice(originalPrice)} (${discount}% OFF)\n` : '') +
          `🛡️ Warranty: ${phone.warranty_type || 'Seller Warranty'}\n\n` +
          `📍 Available at: Delhi NCR\n` +
          `📞 WhatsApp: +91 99107 24940`,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching phone:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update phone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
      images,
    } = body;

    // Validate required fields
    if (!name || !brand || !price || !imei) {
      return NextResponse.json(
        { error: "Name, brand, price, and IMEI are required" },
        { status: 400 }
      );
    }

    // Use rupee values directly (no paise conversion)
    const sellingPrice = parseFloat(price);
    const originalMrp = originalPrice ? parseFloat(originalPrice) : null;
    const costPrice = cost ? parseFloat(cost) : sellingPrice;

    const phoneData = {
      brand,
      model_name: name,
      model_number: model || null,
      variant: storage || null,
      color: color || null,
      imei_1: imei,
      condition_grade: condition || "B",
      battery_health_percent: batteryHealth ? parseInt(batteryHealth) : null,
      cost_price: costPrice,
      selling_price: sellingPrice,
      original_mrp: originalMrp,
      images: images || [],
      thumbnail_url: images?.[0] || null,
      status: status || "Available",
      description: description || null,
    };

    const { data, error } = await supabase
      .from("phones")
      .update(phoneData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating phone:", error);
      
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A phone with this IMEI already exists" },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ phone: data, message: "Phone updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/phones/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE phone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("phones")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting phone:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Phone deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/phones/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
