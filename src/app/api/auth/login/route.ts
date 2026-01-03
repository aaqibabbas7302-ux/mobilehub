import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  // First, try to find user in database
  const { data: user, error: userError } = await supabase
    .from("admin_users")
    .select("*")
    .or(`username.eq.${username},email.eq.${username}`)
    .single();

  if (userError && userError.code !== "PGRST116") {
    console.error("Error finding user:", userError);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  if (user) {
    // Verify password using database function
    const { data: isValid, error: verifyError } = await supabase
      .rpc("verify_password", { password, hash: user.password_hash });

    if (verifyError) {
      console.error("Error verifying password:", verifyError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    // Update last login
    await supabase
      .from("admin_users")
      .update({
        last_login_at: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1,
      })
      .eq("id", user.id);

    // Log activity
    await supabase.from("activity_logs").insert([{
      user_id: user.id,
      action: "login",
      description: `User ${user.username} logged in`,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    }]);

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        permissions: user.permissions,
      },
    });
  }

  // Fallback: Check environment variables (for backward compatibility)
  const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "mobilehub@123";

  if (username === envUsername && password === envPassword) {
    return NextResponse.json({
      success: true,
      user: {
        id: "env-admin",
        username: envUsername,
        email: "admin@mobilehub.delhi",
        full_name: "Admin (Legacy)",
        role: "super_admin",
        permissions: {
          dashboard: { read: true },
          inventory: { read: true, write: true, delete: true },
          customers: { read: true, write: true, delete: true },
          orders: { read: true, write: true, delete: true },
          inquiries: { read: true, write: true, delete: true },
          leads: { read: true, write: true, delete: true },
          marketing: { read: true, write: true, delete: true },
          conversations: { read: true, write: true },
          settings: { read: true, write: true },
          users: { read: true, write: true, delete: true },
        },
      },
    });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
