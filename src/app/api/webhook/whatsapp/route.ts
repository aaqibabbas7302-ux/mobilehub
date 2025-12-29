import { NextRequest, NextResponse } from "next/server";

/**
 * WhatsApp Webhook Handler for n8n Integration
 * 
 * This endpoint receives webhook data from n8n workflow
 * and processes customer inquiries.
 */

interface WhatsAppMessage {
  from: string;
  name?: string;
  message: string;
  timestamp: string;
  messageId?: string;
}

interface WebhookPayload {
  type: "message" | "status";
  data: WhatsAppMessage;
}

// Store conversation context (in production, use Redis/database)
const conversationContext: Record<string, {
  lastMessage: string;
  intent?: string;
  extractedBrand?: string;
  extractedBudget?: number;
  timestamp: number;
}> = {};

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();

    // Validate webhook
    if (payload.type !== "message") {
      return NextResponse.json({ success: true, action: "ignored" });
    }

    const { from, name, message, messageId } = payload.data;

    // Extract intent and entities from message
    const analysis = analyzeMessage(message);

    // Store conversation context
    conversationContext[from] = {
      lastMessage: message,
      intent: analysis.intent,
      extractedBrand: analysis.brand,
      extractedBudget: analysis.budget,
      timestamp: Date.now(),
    };

    // Log the inquiry (in production, store in Supabase)
    console.log("WhatsApp Inquiry:", {
      from,
      name,
      message,
      messageId,
      analysis,
    });

    // Return analysis for n8n to use
    return NextResponse.json({
      success: true,
      customerPhone: from,
      customerName: name,
      message,
      analysis: {
        intent: analysis.intent,
        brand: analysis.brand,
        model: analysis.model,
        budget: analysis.budget,
        keywords: analysis.keywords,
      },
      suggestedAction: analysis.suggestedAction,
      apiEndpoint: analysis.apiEndpoint,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

function analyzeMessage(message: string): {
  intent: string;
  brand?: string;
  model?: string;
  budget?: number;
  keywords: string[];
  suggestedAction: string;
  apiEndpoint: string;
} {
  const lowerMessage = message.toLowerCase();
  const keywords: string[] = [];

  // Detect brand
  const brands = ["apple", "iphone", "samsung", "galaxy", "oneplus", "xiaomi", "redmi", "vivo", "oppo", "realme", "google", "pixel"];
  let brand: string | undefined;
  for (const b of brands) {
    if (lowerMessage.includes(b)) {
      brand = b === "iphone" ? "Apple" : 
              b === "galaxy" ? "Samsung" : 
              b === "redmi" ? "Xiaomi" :
              b === "pixel" ? "Google" :
              b.charAt(0).toUpperCase() + b.slice(1);
      keywords.push(b);
      break;
    }
  }

  // Detect model names
  const modelPatterns = [
    /iphone\s*(\d+)\s*(pro|plus|max)?/i,
    /galaxy\s*(s|a|m|z)?\s*(\d+)/i,
    /oneplus\s*(\d+)\s*(r|t|pro)?/i,
    /redmi\s*note\s*(\d+)/i,
  ];
  let model: string | undefined;
  for (const pattern of modelPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      model = match[0];
      keywords.push(model);
      break;
    }
  }

  // Detect budget
  const budgetPatterns = [
    /(?:under|below|within|upto|max|budget)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)?(?:k)?)/i,
    /(\d+(?:,\d+)?(?:k)?)\s*(?:rs\.?|₹|inr)?\s*(?:budget|max|ke\s*andar)/i,
    /(?:rs\.?|₹|inr)\s*(\d+(?:,\d+)?(?:k)?)/i,
  ];
  let budget: number | undefined;
  for (const pattern of budgetPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      let num = match[1].replace(/,/g, "");
      if (num.toLowerCase().endsWith("k")) {
        budget = parseInt(num) * 1000;
      } else {
        budget = parseInt(num);
      }
      keywords.push(`budget:${budget}`);
      break;
    }
  }

  // Detect intent
  let intent = "general_inquiry";
  let suggestedAction = "search_inventory";
  let apiEndpoint = "/api/phones/search";

  if (lowerMessage.includes("available") || lowerMessage.includes("stock") || lowerMessage.includes("hai kya")) {
    intent = "availability_check";
    suggestedAction = "check_availability";
  } else if (lowerMessage.includes("price") || lowerMessage.includes("rate") || lowerMessage.includes("kitne")) {
    intent = "price_inquiry";
    suggestedAction = "get_price";
  } else if (lowerMessage.includes("buy") || lowerMessage.includes("kharidna") || lowerMessage.includes("lena hai")) {
    intent = "purchase_intent";
    suggestedAction = "connect_sales";
  } else if (brand || model) {
    intent = "product_search";
    suggestedAction = "search_inventory";
  } else if (budget) {
    intent = "budget_search";
    suggestedAction = "search_by_budget";
  } else if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("namaste")) {
    intent = "greeting";
    suggestedAction = "send_welcome";
    apiEndpoint = "";
  }

  // Build API endpoint with parameters
  if (suggestedAction === "search_inventory" || suggestedAction === "search_by_budget") {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (model) params.set("query", model);
    if (budget) params.set("maxPrice", budget.toString());
    params.set("status", "Available");
    params.set("limit", "5");
    apiEndpoint = `/api/phones/search?${params.toString()}`;
  }

  return {
    intent,
    brand,
    model,
    budget,
    keywords,
    suggestedAction,
    apiEndpoint,
  };
}

// GET endpoint for testing/health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "MobileHub Delhi WhatsApp Webhook",
    version: "1.0.0",
    endpoints: {
      search: "/api/phones/search",
      details: "/api/phones/[id]",
      webhook: "/api/webhook/whatsapp",
    },
  });
}
