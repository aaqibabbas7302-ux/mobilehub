import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Retrieve settings
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();
    
    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine for first time
      throw error;
    }
    
    // Return default settings if none exist
    const defaultSettings = {
      store_name: "MobileHub Delhi",
      tagline: "Premium Second-Hand Phones in Delhi",
      description: "Delhi's most trusted destination for certified pre-owned smartphones. Quality guaranteed with warranty.",
      phone: "+91 99107 24940",
      email: "contact@mobilehubdelhi.com",
      website: "https://mobilehubdelhi.com",
      address: "123 Mobile Market, Karol Bagh, New Delhi - 110005",
      open_time: "10:00 AM",
      close_time: "9:00 PM",
      instagram: "",
      facebook: "",
      twitter: "",
      whatsapp_number: "+91 99107 24940",
      welcome_message: "🙏 Namaste! Welcome to MobileHub Delhi. How can I help you find your perfect phone today?",
      ai_auto_reply: true,
      agent_name: "MobileHub Assistant",
      response_language: "Hindi + English (Hinglish)",
      suggest_alternatives: true,
      notify_new_order: true,
      notify_inquiry: true,
      notify_low_stock: true,
      notify_daily_summary: false,
      notify_marketing: false,
      two_factor_auth: false,
      login_alerts: true,
      session_timeout: true,
    };
    
    return NextResponse.json({
      success: true,
      settings: data || defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const settings = await request.json();
    
    // Check if settings exist
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .single();
    
    let result;
    if (existing) {
      // Update existing settings
      result = await supabase
        .from("settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from("settings")
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return NextResponse.json({
      success: true,
      settings: result.data,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

// PUT - Update specific settings (partial update)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const updates = await request.json();
    
    // Get existing settings
    const { data: existing } = await supabase
      .from("settings")
      .select("*")
      .single();
    
    let result;
    if (existing) {
      // Merge updates with existing settings
      const mergedSettings = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      result = await supabase
        .from("settings")
        .update(mergedSettings)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new settings with updates
      result = await supabase
        .from("settings")
        .insert({
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return NextResponse.json({
      success: true,
      settings: result.data,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
