-- Migration: Add theme customization to settings
-- This adds theme configuration for both admin panel and public website

-- Add theme_config column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "mode": "dark",
  "admin": {
    "primaryColor": "#f97316",
    "accentColor": "#06b6d4",
    "sidebarStyle": "glass"
  },
  "website": {
    "primaryColor": "#f97316",
    "secondaryColor": "#06b6d4",
    "backgroundColor": "#030712",
    "heroStyle": "gradient",
    "cardStyle": "glass",
    "enableNeonEffects": true,
    "enableAnimatedOrbs": true,
    "enableGlassmorphism": true,
    "borderRadius": "lg",
    "fontFamily": "geist"
  },
  "preset": "neon-orange"
}'::jsonb;

-- Create theme_presets table for storing preset themes
CREATE TABLE IF NOT EXISTS theme_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  theme_config JSONB NOT NULL,
  preview_colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default theme presets
INSERT INTO theme_presets (name, slug, description, is_default, theme_config, preview_colors) VALUES
(
  'Neon Orange',
  'neon-orange',
  'Vibrant orange with cyan accents - Default futuristic look',
  true,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#f97316",
      "accentColor": "#06b6d4",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#f97316",
      "secondaryColor": "#06b6d4",
      "backgroundColor": "#030712",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "lg",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#f97316", "#06b6d4", "#030712"]'::jsonb
),
(
  'Ocean Blue',
  'ocean-blue',
  'Cool blue tones with purple accents',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#3b82f6",
      "accentColor": "#8b5cf6",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#8b5cf6",
      "backgroundColor": "#020617",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "lg",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#3b82f6", "#8b5cf6", "#020617"]'::jsonb
),
(
  'Forest Green',
  'forest-green',
  'Natural green with gold accents',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#22c55e",
      "accentColor": "#eab308",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#22c55e",
      "secondaryColor": "#eab308",
      "backgroundColor": "#052e16",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "lg",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#22c55e", "#eab308", "#052e16"]'::jsonb
),
(
  'Royal Purple',
  'royal-purple',
  'Elegant purple with pink accents',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#8b5cf6",
      "accentColor": "#ec4899",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#8b5cf6",
      "secondaryColor": "#ec4899",
      "backgroundColor": "#0f0720",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "lg",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#8b5cf6", "#ec4899", "#0f0720"]'::jsonb
),
(
  'Crimson Red',
  'crimson-red',
  'Bold red with orange warmth',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#ef4444",
      "accentColor": "#f97316",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#ef4444",
      "secondaryColor": "#f97316",
      "backgroundColor": "#1c0a0a",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "lg",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#ef4444", "#f97316", "#1c0a0a"]'::jsonb
),
(
  'Minimal Dark',
  'minimal-dark',
  'Clean and minimal dark theme',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#ffffff",
      "accentColor": "#71717a",
      "sidebarStyle": "solid"
    },
    "website": {
      "primaryColor": "#ffffff",
      "secondaryColor": "#71717a",
      "backgroundColor": "#09090b",
      "heroStyle": "solid",
      "cardStyle": "solid",
      "enableNeonEffects": false,
      "enableAnimatedOrbs": false,
      "enableGlassmorphism": false,
      "borderRadius": "md",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#ffffff", "#71717a", "#09090b"]'::jsonb
),
(
  'Corporate Light',
  'corporate-light',
  'Professional light theme for business',
  false,
  '{
    "mode": "light",
    "admin": {
      "primaryColor": "#2563eb",
      "accentColor": "#0891b2",
      "sidebarStyle": "solid"
    },
    "website": {
      "primaryColor": "#2563eb",
      "secondaryColor": "#0891b2",
      "backgroundColor": "#ffffff",
      "heroStyle": "solid",
      "cardStyle": "bordered",
      "enableNeonEffects": false,
      "enableAnimatedOrbs": false,
      "enableGlassmorphism": false,
      "borderRadius": "md",
      "fontFamily": "inter"
    }
  }'::jsonb,
  '["#2563eb", "#0891b2", "#ffffff"]'::jsonb
),
(
  'Sunset Warm',
  'sunset-warm',
  'Warm sunset colors with pink and orange',
  false,
  '{
    "mode": "dark",
    "admin": {
      "primaryColor": "#f43f5e",
      "accentColor": "#fb923c",
      "sidebarStyle": "glass"
    },
    "website": {
      "primaryColor": "#f43f5e",
      "secondaryColor": "#fb923c",
      "backgroundColor": "#18080d",
      "heroStyle": "gradient",
      "cardStyle": "glass",
      "enableNeonEffects": true,
      "enableAnimatedOrbs": true,
      "enableGlassmorphism": true,
      "borderRadius": "xl",
      "fontFamily": "geist"
    }
  }'::jsonb,
  '["#f43f5e", "#fb923c", "#18080d"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Add updated_at trigger for theme_presets
CREATE OR REPLACE FUNCTION update_theme_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS theme_presets_updated_at ON theme_presets;
CREATE TRIGGER theme_presets_updated_at
  BEFORE UPDATE ON theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_presets_updated_at();

-- Enable RLS
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for theme_presets
CREATE POLICY "Allow public read access to theme_presets"
  ON theme_presets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage custom presets"
  ON theme_presets FOR ALL
  TO authenticated
  USING (is_custom = true)
  WITH CHECK (is_custom = true);

-- Comment on table
COMMENT ON TABLE theme_presets IS 'Stores theme preset configurations for the application';
COMMENT ON COLUMN settings.theme_config IS 'JSON configuration for admin and website theme customization';
