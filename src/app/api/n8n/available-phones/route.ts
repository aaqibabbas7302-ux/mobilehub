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

/**
 * n8n API Endpoint - Returns available phones formatted for WhatsApp/AI agents
 * 
 * GET /api/n8n/available-phones
 * Query params:
 *   - brand: Filter by brand (optional)
 *   - limit: Max results (default: 50)
 * 
 * Response includes:
 *   - phones: Array of available phones with formatted prices
 *   - catalog: Pre-formatted text catalog for WhatsApp
 *   - count: Total available phones
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const brand = searchParams.get("brand");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("phones")
      .select("*")
      .eq("status", "Available")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (brand) {
      query = query.ilike("brand", `%${brand}%`);
    }

    const { data: phones, error } = await query;

    if (error) {
      console.error("Error fetching phones:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Format phones for n8n/WhatsApp
    const formattedPhones = (phones || []).map((phone) => {
      const sellingPrice = phone.selling_price_paise / 100;
      const originalPrice = phone.original_mrp_paise ? phone.original_mrp_paise / 100 : null;
      const discount = originalPrice && originalPrice > sellingPrice
        ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
        : 0;
      const condition = conditionLabels[phone.condition_grade] || phone.condition_grade;

      return {
        id: phone.id,
        brand: phone.brand,
        model: phone.model_name,
        storage: phone.variant,
        color: phone.color,
        condition: condition,
        battery_health: phone.battery_health_percent,
        price: sellingPrice,
        price_formatted: formatPrice(sellingPrice),
        original_price: originalPrice,
        original_price_formatted: originalPrice ? formatPrice(originalPrice) : null,
        discount_percent: discount,
        description: phone.description,
        images: phone.images || [],
        warranty: phone.warranty_type || "Seller Warranty",
        // Formatted summary for WhatsApp
        summary: `${phone.brand} ${phone.model_name} ${phone.variant || ''} - ${formatPrice(sellingPrice)}${discount > 0 ? ` (${discount}% OFF)` : ''} - ${condition} condition${phone.battery_health_percent ? `, ${phone.battery_health_percent}% battery` : ''}`,
        // Full WhatsApp message
        whatsapp_details: `📱 *${phone.brand} ${phone.model_name}*\n` +
          `💾 ${phone.variant || 'N/A'} | 🎨 ${phone.color || 'N/A'}\n` +
          `⭐ ${condition} | 🔋 ${phone.battery_health_percent || 'N/A'}%\n` +
          `💰 *${formatPrice(sellingPrice)}*${originalPrice ? ` (MRP: ${formatPrice(originalPrice)})` : ''}\n` +
          (phone.description ? `📝 ${phone.description}\n` : '') +
          `🛡️ ${phone.warranty_type || 'Seller Warranty'}`,
      };
    });

    // Generate a catalog text for the AI agent
    let catalogText = `📱 *Available Phones at MobileHub Delhi*\n`;
    catalogText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (formattedPhones.length === 0) {
      catalogText += `Currently no phones available. Please check back later!\n`;
    } else {
      // Group by brand
      const brandGroups: Record<string, typeof formattedPhones> = {};
      formattedPhones.forEach((phone) => {
        if (!brandGroups[phone.brand]) {
          brandGroups[phone.brand] = [];
        }
        brandGroups[phone.brand].push(phone);
      });

      Object.entries(brandGroups).forEach(([brandName, brandPhones]) => {
        catalogText += `*${brandName}*\n`;
        brandPhones.forEach((phone, i) => {
          catalogText += `${i + 1}. ${phone.model} ${phone.storage || ''}\n`;
          catalogText += `   💰 ${phone.price_formatted}${phone.discount_percent > 0 ? ` (-${phone.discount_percent}%)` : ''}\n`;
          catalogText += `   ⭐ ${phone.condition}${phone.battery_health ? ` | 🔋 ${phone.battery_health}%` : ''}\n\n`;
        });
      });

      catalogText += `━━━━━━━━━━━━━━━━━━━━━\n`;
      catalogText += `📞 WhatsApp: +91 99107 24940\n`;
      catalogText += `📍 Delhi NCR | 🛡️ 6 Month Warranty`;
    }

    return NextResponse.json({
      success: true,
      count: formattedPhones.length,
      phones: formattedPhones,
      catalog: catalogText,
      // Quick summary for AI context
      summary: {
        total_available: formattedPhones.length,
        brands: [...new Set(formattedPhones.map(p => p.brand))],
        price_range: formattedPhones.length > 0 ? {
          min: Math.min(...formattedPhones.map(p => p.price)),
          max: Math.max(...formattedPhones.map(p => p.price)),
          min_formatted: formatPrice(Math.min(...formattedPhones.map(p => p.price))),
          max_formatted: formatPrice(Math.max(...formattedPhones.map(p => p.price))),
        } : null,
      },
    });
  } catch (error) {
    console.error("Error in n8n API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
