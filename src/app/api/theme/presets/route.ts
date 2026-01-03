import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/theme/presets - Get all theme presets
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: presets, error } = await supabase
      .from("theme_presets")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      // If table doesn't exist, return default presets
      if (error.code === "42P01") {
        return NextResponse.json(getDefaultPresets());
      }
      throw error;
    }

    return NextResponse.json(presets || getDefaultPresets());
  } catch (error) {
    console.error("Error fetching theme presets:", error);
    // Return default presets on error
    return NextResponse.json(getDefaultPresets());
  }
}

// POST /api/theme/presets - Create a custom preset
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, description, theme_config } = body;

    if (!name || !theme_config) {
      return NextResponse.json(
        { error: "Name and theme_config are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = `custom-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    // Extract preview colors
    const preview_colors = [
      theme_config.website?.primaryColor || "#f97316",
      theme_config.website?.secondaryColor || "#06b6d4",
      theme_config.website?.backgroundColor || "#030712",
    ];

    const { data: preset, error } = await supabase
      .from("theme_presets")
      .insert({
        name,
        slug,
        description: description || `Custom theme: ${name}`,
        is_default: false,
        is_custom: true,
        theme_config,
        preview_colors,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error("Error creating theme preset:", error);
    return NextResponse.json(
      { error: "Failed to create theme preset" },
      { status: 500 }
    );
  }
}

// Default presets to return if database is not set up
function getDefaultPresets() {
  return [
    {
      id: "1",
      name: "Neon Orange",
      slug: "neon-orange",
      description: "Vibrant orange with cyan accents - Default futuristic look",
      is_default: true,
      is_custom: false,
      theme_config: {
        mode: "dark",
        admin: {
          primaryColor: "#f97316",
          accentColor: "#06b6d4",
          sidebarStyle: "glass",
        },
        website: {
          primaryColor: "#f97316",
          secondaryColor: "#06b6d4",
          backgroundColor: "#030712",
          heroStyle: "gradient",
          cardStyle: "glass",
          enableNeonEffects: true,
          enableAnimatedOrbs: true,
          enableGlassmorphism: true,
          borderRadius: "lg",
          fontFamily: "geist",
        },
      },
      preview_colors: ["#f97316", "#06b6d4", "#030712"],
    },
    {
      id: "2",
      name: "Ocean Blue",
      slug: "ocean-blue",
      description: "Cool blue tones with purple accents",
      is_default: false,
      is_custom: false,
      theme_config: {
        mode: "dark",
        admin: {
          primaryColor: "#3b82f6",
          accentColor: "#8b5cf6",
          sidebarStyle: "glass",
        },
        website: {
          primaryColor: "#3b82f6",
          secondaryColor: "#8b5cf6",
          backgroundColor: "#020617",
          heroStyle: "gradient",
          cardStyle: "glass",
          enableNeonEffects: true,
          enableAnimatedOrbs: true,
          enableGlassmorphism: true,
          borderRadius: "lg",
          fontFamily: "geist",
        },
      },
      preview_colors: ["#3b82f6", "#8b5cf6", "#020617"],
    },
    {
      id: "3",
      name: "Forest Green",
      slug: "forest-green",
      description: "Natural green with gold accents",
      is_default: false,
      is_custom: false,
      theme_config: {
        mode: "dark",
        admin: {
          primaryColor: "#22c55e",
          accentColor: "#eab308",
          sidebarStyle: "glass",
        },
        website: {
          primaryColor: "#22c55e",
          secondaryColor: "#eab308",
          backgroundColor: "#052e16",
          heroStyle: "gradient",
          cardStyle: "glass",
          enableNeonEffects: true,
          enableAnimatedOrbs: true,
          enableGlassmorphism: true,
          borderRadius: "lg",
          fontFamily: "geist",
        },
      },
      preview_colors: ["#22c55e", "#eab308", "#052e16"],
    },
    {
      id: "4",
      name: "Royal Purple",
      slug: "royal-purple",
      description: "Elegant purple with pink accents",
      is_default: false,
      is_custom: false,
      theme_config: {
        mode: "dark",
        admin: {
          primaryColor: "#8b5cf6",
          accentColor: "#ec4899",
          sidebarStyle: "glass",
        },
        website: {
          primaryColor: "#8b5cf6",
          secondaryColor: "#ec4899",
          backgroundColor: "#0f0720",
          heroStyle: "gradient",
          cardStyle: "glass",
          enableNeonEffects: true,
          enableAnimatedOrbs: true,
          enableGlassmorphism: true,
          borderRadius: "lg",
          fontFamily: "geist",
        },
      },
      preview_colors: ["#8b5cf6", "#ec4899", "#0f0720"],
    },
    {
      id: "5",
      name: "Minimal Dark",
      slug: "minimal-dark",
      description: "Clean and minimal dark theme",
      is_default: false,
      is_custom: false,
      theme_config: {
        mode: "dark",
        admin: {
          primaryColor: "#ffffff",
          accentColor: "#71717a",
          sidebarStyle: "solid",
        },
        website: {
          primaryColor: "#ffffff",
          secondaryColor: "#71717a",
          backgroundColor: "#09090b",
          heroStyle: "solid",
          cardStyle: "solid",
          enableNeonEffects: false,
          enableAnimatedOrbs: false,
          enableGlassmorphism: false,
          borderRadius: "md",
          fontFamily: "geist",
        },
      },
      preview_colors: ["#ffffff", "#71717a", "#09090b"],
    },
    {
      id: "6",
      name: "Corporate Light",
      slug: "corporate-light",
      description: "Professional light theme for business",
      is_default: false,
      is_custom: false,
      theme_config: {
        mode: "light",
        admin: {
          primaryColor: "#2563eb",
          accentColor: "#0891b2",
          sidebarStyle: "solid",
        },
        website: {
          primaryColor: "#2563eb",
          secondaryColor: "#0891b2",
          backgroundColor: "#ffffff",
          heroStyle: "solid",
          cardStyle: "bordered",
          enableNeonEffects: false,
          enableAnimatedOrbs: false,
          enableGlassmorphism: false,
          borderRadius: "md",
          fontFamily: "inter",
        },
      },
      preview_colors: ["#2563eb", "#0891b2", "#ffffff"],
    },
  ];
}
