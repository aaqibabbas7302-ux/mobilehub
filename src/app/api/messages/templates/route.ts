import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Message templates API
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get("platform");
  const category = searchParams.get("category");
  const activeOnly = searchParams.get("activeOnly") === "true";

  let query = supabase
    .from("message_templates")
    .select("*")
    .order("usage_count", { ascending: false });

  if (platform && platform !== "all") {
    query = query.or(`platform.eq.${platform},platform.eq.all`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching message templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    name,
    platform,
    content,
    variables,
    category,
    is_active,
  } = body;

  if (!name || !content) {
    return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
  }

  const templateData = {
    name,
    platform: platform || "all",
    content,
    variables: variables || [],
    category: category || "custom",
    is_active: is_active !== false,
  };

  const { data, error } = await supabase
    .from("message_templates")
    .insert([templateData])
    .select()
    .single();

  if (error) {
    console.error("Error creating message template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("message_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating message template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting message template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
