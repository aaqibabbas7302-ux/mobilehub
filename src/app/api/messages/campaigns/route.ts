import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Message campaigns API
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  let query = supabase
    .from("message_campaigns")
    .select("*, message_templates(name, content)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    name,
    platform,
    template_id,
    message_content,
    target_audience,
    target_tags,
    scheduled_at,
  } = body;

  if (!name || !platform || !message_content) {
    return NextResponse.json({ 
      error: "Name, platform, and message content are required" 
    }, { status: 400 });
  }

  // Calculate target count based on audience
  let targetCount = 0;
  
  if (target_audience === "all_followers") {
    const { count } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("platform", platform)
      .eq("can_message", true);
    targetCount = count || 0;
  } else if (target_audience === "new_leads") {
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("source", platform)
      .eq("status", "new");
    targetCount = count || 0;
  }

  const campaignData = {
    name,
    platform,
    template_id: template_id || null,
    message_content,
    target_audience: target_audience || "all_followers",
    target_tags: target_tags || [],
    target_count: targetCount,
    status: scheduled_at ? "scheduled" : "draft",
    scheduled_at: scheduled_at || null,
  };

  const { data, error } = await supabase
    .from("message_campaigns")
    .insert([campaignData])
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update template usage count if template was used
  if (template_id) {
    await supabase.rpc("increment_template_usage", { template_id });
  }

  return NextResponse.json({ campaign: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, action, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
  }

  // Handle special actions
  if (action === "start") {
    // Start sending the campaign
    const { data: campaign, error: fetchError } = await supabase
      .from("message_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Update status to sending
    const { error } = await supabase
      .from("message_campaigns")
      .update({
        status: "sending",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Actually send messages via Instagram/Facebook API
    // This would be handled by a background job/webhook
    // For now, we just update the status

    return NextResponse.json({ success: true, message: "Campaign started" });
  }

  if (action === "cancel") {
    const { error } = await supabase
      .from("message_campaigns")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Campaign cancelled" });
  }

  // Regular update
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("message_campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
  }

  // Only allow deleting draft or cancelled campaigns
  const { data: campaign } = await supabase
    .from("message_campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (campaign && !["draft", "cancelled"].includes(campaign.status)) {
    return NextResponse.json({ 
      error: "Can only delete draft or cancelled campaigns" 
    }, { status: 400 });
  }

  const { error } = await supabase
    .from("message_campaigns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
