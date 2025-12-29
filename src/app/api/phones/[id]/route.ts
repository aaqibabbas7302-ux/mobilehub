import { NextRequest, NextResponse } from "next/server";

// Mock phone data - replace with Supabase
const phones: Record<string, {
  id: string;
  brand: string;
  model_name: string;
  variant: string;
  color: string;
  condition_grade: string;
  battery_health_percent: number;
  selling_price_paise: number;
  original_mrp_paise: number;
  warranty_type: string;
  status: string;
  screen_condition: string;
  body_condition: string;
  imei_verified: boolean;
  accessories_included: string[];
}> = {
  "1": { id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight", condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900, original_mrp_paise: 7990000, warranty_type: "60 Days", status: "Available", screen_condition: "Perfect", body_condition: "Excellent", imei_verified: true, accessories_included: ["Charger", "Box"] },
  "2": { id: "2", brand: "Samsung", model_name: "Galaxy S23", variant: "8GB/256GB", color: "Phantom Black", condition_grade: "A", battery_health_percent: 88, selling_price_paise: 4899900, original_mrp_paise: 7499900, warranty_type: "30 Days", status: "Available", screen_condition: "Good", body_condition: "Good", imei_verified: true, accessories_included: ["Charger"] },
};

function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const phone = phones[id];

  if (!phone) {
    return NextResponse.json(
      { success: false, error: "Phone not found" },
      { status: 404 }
    );
  }

  // Calculate discount
  const discount = phone.original_mrp_paise > phone.selling_price_paise
    ? Math.round(((phone.original_mrp_paise - phone.selling_price_paise) / phone.original_mrp_paise) * 100)
    : 0;

  const response = {
    success: true,
    data: {
      ...phone,
      price: formatPrice(phone.selling_price_paise),
      originalPrice: formatPrice(phone.original_mrp_paise),
      discount: `${discount}%`,
      // WhatsApp-friendly detailed text
      whatsappText: `📱 *${phone.brand} ${phone.model_name}*\n\n` +
        `💾 Storage: ${phone.variant}\n` +
        `🎨 Color: ${phone.color}\n` +
        `⭐ Condition: Grade ${phone.condition_grade}\n` +
        `📱 Screen: ${phone.screen_condition}\n` +
        `🔋 Battery: ${phone.battery_health_percent}%\n` +
        `✅ IMEI Verified: ${phone.imei_verified ? 'Yes' : 'No'}\n` +
        `📦 Accessories: ${phone.accessories_included.join(', ')}\n\n` +
        `💰 Price: *${formatPrice(phone.selling_price_paise)}*\n` +
        `🏷️ MRP: ${formatPrice(phone.original_mrp_paise)} (${discount}% OFF)\n` +
        `🛡️ Warranty: ${phone.warranty_type}\n\n` +
        `📍 Available at: Nehru Place, Delhi\n` +
        `📞 Call: +91 98765 43210`,
    },
  };

  return NextResponse.json(response);
}
