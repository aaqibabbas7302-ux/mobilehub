import { NextRequest, NextResponse } from "next/server";

// Mock data - replace with Supabase queries
const phones = [
  { id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight", condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900, original_mrp_paise: 7990000, warranty_type: "60 Days", status: "Available" },
  { id: "2", brand: "Samsung", model_name: "Galaxy S23", variant: "8GB/256GB", color: "Phantom Black", condition_grade: "A", battery_health_percent: 88, selling_price_paise: 4899900, original_mrp_paise: 7499900, warranty_type: "30 Days", status: "Available" },
  { id: "3", brand: "OnePlus", model_name: "11R 5G", variant: "8GB/128GB", color: "Sonic Black", condition_grade: "A+", battery_health_percent: 95, selling_price_paise: 3199900, original_mrp_paise: 3999900, warranty_type: "60 Days", status: "Available" },
  { id: "4", brand: "Apple", model_name: "iPhone 12", variant: "64GB", color: "Blue", condition_grade: "B+", battery_health_percent: 84, selling_price_paise: 3499900, original_mrp_paise: 6590000, warranty_type: "30 Days", status: "Available" },
  { id: "5", brand: "Xiaomi", model_name: "Redmi Note 12 Pro", variant: "8GB/128GB", color: "Glacier Blue", condition_grade: "A", battery_health_percent: 96, selling_price_paise: 1899900, original_mrp_paise: 2799900, warranty_type: "30 Days", status: "Available" },
  { id: "6", brand: "Samsung", model_name: "Galaxy A54 5G", variant: "8GB/256GB", color: "Awesome Graphite", condition_grade: "A+", battery_health_percent: 98, selling_price_paise: 2799900, original_mrp_paise: 3899900, warranty_type: "60 Days", status: "Available" },
  { id: "7", brand: "Apple", model_name: "iPhone 14 Pro", variant: "256GB", color: "Deep Purple", condition_grade: "A", battery_health_percent: 90, selling_price_paise: 8999900, original_mrp_paise: 12990000, warranty_type: "90 Days", status: "Available" },
  { id: "8", brand: "OnePlus", model_name: "Nord CE 3", variant: "8GB/128GB", color: "Aqua Surge", condition_grade: "B+", battery_health_percent: 91, selling_price_paise: 2299900, original_mrp_paise: 2699900, warranty_type: "30 Days", status: "Available" },
  { id: "9", brand: "Vivo", model_name: "V29 Pro", variant: "8GB/256GB", color: "Starry Purple", condition_grade: "A+", battery_health_percent: 99, selling_price_paise: 3699900, original_mrp_paise: 4699900, warranty_type: "60 Days", status: "Available" },
  { id: "10", brand: "Realme", model_name: "GT Neo 5", variant: "8GB/128GB", color: "Black", condition_grade: "A", battery_health_percent: 94, selling_price_paise: 2599900, original_mrp_paise: 3499900, warranty_type: "30 Days", status: "Reserved" },
];

function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get filter parameters
  const query = searchParams.get("query")?.toLowerCase() || "";
  const brand = searchParams.get("brand")?.toLowerCase();
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) * 100 : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) * 100 : null;
  const status = searchParams.get("status") || "Available";
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

  // Filter phones
  let results = phones.filter((phone) => {
    // Search query matches brand or model
    const matchesQuery = !query || 
      phone.brand.toLowerCase().includes(query) ||
      phone.model_name.toLowerCase().includes(query) ||
      `${phone.brand} ${phone.model_name}`.toLowerCase().includes(query);

    // Brand filter
    const matchesBrand = !brand || phone.brand.toLowerCase() === brand;

    // Price range
    const matchesMinPrice = !minPrice || phone.selling_price_paise >= minPrice;
    const matchesMaxPrice = !maxPrice || phone.selling_price_paise <= maxPrice;

    // Status
    const matchesStatus = !status || status === "all" || phone.status === status;

    return matchesQuery && matchesBrand && matchesMinPrice && matchesMaxPrice && matchesStatus;
  });

  // Sort by price (lowest first)
  results = results.sort((a, b) => a.selling_price_paise - b.selling_price_paise);

  // Limit results
  results = results.slice(0, limit);

  // Format response for n8n/WhatsApp
  const formattedResults = results.map(phone => ({
    id: phone.id,
    name: `${phone.brand} ${phone.model_name}`,
    variant: phone.variant,
    color: phone.color,
    condition: phone.condition_grade,
    battery: `${phone.battery_health_percent}%`,
    price: formatPrice(phone.selling_price_paise),
    priceRaw: phone.selling_price_paise / 100,
    warranty: phone.warranty_type,
    status: phone.status,
    // WhatsApp-friendly text format
    whatsappText: `📱 *${phone.brand} ${phone.model_name}*\n` +
      `💾 ${phone.variant} | 🎨 ${phone.color}\n` +
      `⭐ Grade ${phone.condition_grade} | 🔋 ${phone.battery_health_percent}%\n` +
      `💰 *${formatPrice(phone.selling_price_paise)}*\n` +
      `📦 ${phone.warranty_type} Warranty\n` +
      `🔗 View: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobilehub.delhi'}/phones/${phone.id}`,
  }));

  return NextResponse.json({
    success: true,
    count: formattedResults.length,
    totalAvailable: phones.filter(p => p.status === "Available").length,
    data: formattedResults,
    // Summary for AI agent
    summary: formattedResults.length > 0 
      ? `Found ${formattedResults.length} phone(s) matching your search.`
      : `No phones found matching "${query}". Try searching for a different brand or model.`,
  });
}

export async function POST(request: NextRequest) {
  // Handle POST requests for more complex queries from n8n
  try {
    const body = await request.json();
    const { query, brand, minBudget, maxBudget, preferredCondition } = body;

    let results = phones.filter(phone => phone.status === "Available");

    // Apply filters
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p => 
        p.brand.toLowerCase().includes(q) || 
        p.model_name.toLowerCase().includes(q)
      );
    }

    if (brand) {
      results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (minBudget) {
      results = results.filter(p => p.selling_price_paise >= minBudget * 100);
    }

    if (maxBudget) {
      results = results.filter(p => p.selling_price_paise <= maxBudget * 100);
    }

    if (preferredCondition) {
      const conditions = Array.isArray(preferredCondition) ? preferredCondition : [preferredCondition];
      results = results.filter(p => conditions.includes(p.condition_grade));
    }

    // Sort by price
    results = results.sort((a, b) => a.selling_price_paise - b.selling_price_paise);

    // Get suggestions if no exact match
    let suggestions: typeof phones = [];
    if (results.length === 0) {
      // Suggest similar phones by brand or price range
      if (brand) {
        suggestions = phones
          .filter(p => p.status === "Available" && p.brand.toLowerCase() === brand.toLowerCase())
          .slice(0, 3);
      }
      
      if (suggestions.length === 0 && maxBudget) {
        suggestions = phones
          .filter(p => p.status === "Available" && p.selling_price_paise <= maxBudget * 100 * 1.2)
          .sort((a, b) => a.selling_price_paise - b.selling_price_paise)
          .slice(0, 3);
      }
    }

    const formatPhone = (phone: typeof phones[0]) => ({
      id: phone.id,
      name: `${phone.brand} ${phone.model_name}`,
      variant: phone.variant,
      price: formatPrice(phone.selling_price_paise),
      priceRaw: phone.selling_price_paise / 100,
      condition: phone.condition_grade,
      battery: phone.battery_health_percent,
      warranty: phone.warranty_type,
    });

    return NextResponse.json({
      success: true,
      found: results.length > 0,
      count: results.length,
      data: results.slice(0, 5).map(formatPhone),
      suggestions: suggestions.map(formatPhone),
      message: results.length > 0
        ? `Great news! We have ${results.length} phone(s) available that match your requirements.`
        : suggestions.length > 0
        ? `We don't have an exact match, but here are some similar options you might like:`
        : `Sorry, we currently don't have phones matching your requirements. Please check back later or tell us your preferences and we'll notify you when available!`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
