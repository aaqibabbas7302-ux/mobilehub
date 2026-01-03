import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET all users
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get("role");
  const active = searchParams.get("active");

  let query = supabase
    .from("admin_users")
    .select("id, username, email, full_name, phone, avatar_url, role, permissions, is_active, last_login_at, login_count, created_at")
    .order("created_at", { ascending: false });

  if (role) {
    query = query.eq("role", role);
  }

  if (active !== null) {
    query = query.eq("is_active", active === "true");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get role presets for reference
  const { data: rolePresets } = await supabase
    .from("role_presets")
    .select("*")
    .order("role");

  return NextResponse.json({ users: data, rolePresets });
}

// CREATE new user
export async function POST(request: NextRequest) {
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
    created_by,
  } = body;

  if (!username || !email || !password || !full_name) {
    return NextResponse.json(
      { error: "Username, email, password, and full name are required" },
      { status: 400 }
    );
  }

  // Check if username or email already exists
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id, username, email")
    .or(`username.eq.${username},email.eq.${email}`)
    .single();

  if (existing) {
    if (existing.username === username) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
    if (existing.email === email) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
  }

  // Get permissions from role preset if not provided
  let userPermissions = permissions;
  if (!userPermissions && role) {
    const { data: preset } = await supabase
      .from("role_presets")
      .select("permissions")
      .eq("role", role)
      .single();
    
    if (preset) {
      userPermissions = preset.permissions;
    }
  }

  // Hash password using the database function
  const { data: hashResult, error: hashError } = await supabase
    .rpc("hash_password", { password });

  if (hashError) {
    console.error("Error hashing password:", hashError);
    return NextResponse.json({ error: "Failed to hash password" }, { status: 500 });
  }

  const userData = {
    username,
    email,
    password_hash: hashResult,
    full_name,
    phone: phone || null,
    avatar_url: avatar_url || null,
    role: role || "staff",
    permissions: userPermissions || {},
    is_active: is_active !== false,
    created_by: created_by || null,
  };

  const { data, error } = await supabase
    .from("admin_users")
    .insert([userData])
    .select("id, username, email, full_name, phone, avatar_url, role, permissions, is_active, created_at")
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
