import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { customerIds, message } = await request.json();

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: "No customers selected" }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch customer details
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id, name, phone")
      .in("id", customerIds);

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: "No valid customers found" }, { status: 404 });
    }

    // Send messages (Mock implementation)
    // In a real implementation, you would call your WhatsApp API provider here.
    // Examples:
    // 1. n8n Webhook: fetch('https://n8n.yourdomain.com/webhook/send', { ... })
    // 2. Waha API: fetch('http://waha:3000/api/sendText', { ... })
    // 3. Official API: fetch('https://graph.facebook.com/v18.0/PHONE_ID/messages', { ... })

    const results = await Promise.all(customers.map(async (customer) => {
      try {
        // Simulate API call delay
        // await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`Sending WhatsApp message to ${customer.name} (${customer.phone}): ${message}`);
        
        // TODO: Replace with actual API call
        // const response = await fetch('YOUR_WHATSAPP_API_ENDPOINT', {
        //   method: 'POST',
        //   body: JSON.stringify({ phone: customer.phone, message })
        // });
        
        return { id: customer.id, status: "sent" };
      } catch (err) {
        console.error(`Failed to send to ${customer.phone}`, err);
        return { id: customer.id, status: "failed" };
      }
    }));

    const successCount = results.filter(r => r.status === "sent").length;

    return NextResponse.json({ 
      success: true, 
      count: successCount,
      results 
    });

  } catch (error) {
    console.error("Error in marketing send:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
