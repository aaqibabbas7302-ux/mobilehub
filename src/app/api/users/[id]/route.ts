import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, email, full_name, phone, avatar_url, role, permissions, is_active, last_login_at, login_count, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}

// UPDATE user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const {
    username,
    email,
    password,
    full_name,
    phone,
    avatar_url,
    role,
    permissions,
    is_active,
  } = body;

  // Build update object
  const updates: Record<string, unknown> = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (role !== undefined) updates.role = role;
  if (permissions !== undefined) updates.permissions = permissions;
  if (is_active !== undefined) updates.is_active = is_active;

  // If password is provided, hash it
  if (password) {
    const { data: hashResult, error: hashError } = await supabase
      .rpc("hash_password", { password });

    if (hashError) {
      console.error("Error hashing password:", hashError);
      return NextResponse.json({ error: "Failed to hash password" }, { status: 500 });
    }

    updates.password_hash = hashResult;
  }

  // If role changed, update permissions from preset
  if (role && !permissions) {
    const { data: preset } = await supabase
      .from("role_presets")
      .select("permissions")
      .eq("role", role)
      .single();
    
    if (preset) {
      updates.permissions = preset.permissions;
    }
  }

  const { data, error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select("id, username, email, full_name, phone, avatar_url, role, permissions, is_active, created_at")
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Don't allow deleting the last super_admin
  const { data: user } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", id)
    .single();

  if (user?.role === "super_admin") {
    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (count && count <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last super admin" },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
