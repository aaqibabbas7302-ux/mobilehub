"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Theme configuration types
export interface AdminTheme {
  primaryColor: string;
  accentColor: string;
  sidebarStyle: "glass" | "solid";
}

export interface WebsiteTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  heroStyle: "gradient" | "solid" | "image";
  cardStyle: "glass" | "solid" | "bordered";
  enableNeonEffects: boolean;
  enableAnimatedOrbs: boolean;
  enableGlassmorphism: boolean;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  fontFamily: "geist" | "inter" | "poppins";
}

export interface ThemeConfig {
  mode: "dark" | "light" | "system";
  admin: AdminTheme;
  website: WebsiteTheme;
  preset?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_default: boolean;
  is_custom: boolean;
  theme_config: ThemeConfig;
  preview_colors: string[];
}

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
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
  preset: "neon-orange",
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to determine if a color is light or dark
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// Helper to generate CSS variables from theme config
function generateCSSVariables(theme: ThemeConfig): string {
  const { mode, admin, website } = theme;
  const isDark = mode === "dark" || (mode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const primaryRgb = hexToRgb(website.primaryColor);
  const secondaryRgb = hexToRgb(website.secondaryColor);
  const bgRgb = hexToRgb(website.backgroundColor);
  const adminPrimaryRgb = hexToRgb(admin.primaryColor);

  const borderRadiusMap = {
    none: "0",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  };

  return `
    :root {
      /* Mode */
      --theme-mode: ${mode};
      
      /* Primary Colors */
      --primary: ${website.primaryColor};
      --primary-rgb: ${primaryRgb ? `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}` : "249, 115, 22"};
      --primary-foreground: ${isLightColor(website.primaryColor) ? "#030712" : "#ffffff"};
      
      /* Secondary/Accent Colors */
      --secondary-color: ${website.secondaryColor};
      --secondary-rgb: ${secondaryRgb ? `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}` : "6, 182, 212"};
      
      /* Background */
      --background: ${isDark ? website.backgroundColor : "#ffffff"};
      --background-rgb: ${bgRgb ? `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}` : "3, 7, 18"};
      --foreground: ${isDark ? "#f8fafc" : "#0f172a"};
      
      /* Neon Colors - Override defaults */
      --neon-orange: ${website.primaryColor};
      --neon-cyan: ${website.secondaryColor};
      --neon-primary: ${website.primaryColor};
      --neon-secondary: ${website.secondaryColor};
      
      /* Accent */
      --accent: ${isDark ? `rgba(${primaryRgb?.r || 249}, ${primaryRgb?.g || 115}, ${primaryRgb?.b || 22}, 0.1)` : `rgba(${primaryRgb?.r || 249}, ${primaryRgb?.g || 115}, ${primaryRgb?.b || 22}, 0.05)`};
      --accent-foreground: ${website.primaryColor};
      
      /* Ring */
      --ring: ${website.primaryColor};
      
      /* Border Radius */
      --radius: ${borderRadiusMap[website.borderRadius]};
      
      /* Admin Specific */
      --admin-primary: ${admin.primaryColor};
      --admin-accent: ${admin.accentColor};
      
      /* Glass Effect */
      --glass-bg: ${isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.8)"};
      --glass-border: ${isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(0, 0, 0, 0.1)"};
      
      /* Sidebar */
      --sidebar: ${isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"};
      --sidebar-foreground: ${isDark ? "#f8fafc" : "#0f172a"};
      --sidebar-primary: ${admin.primaryColor};
      --sidebar-accent: rgba(${adminPrimaryRgb?.r || 249}, ${adminPrimaryRgb?.g || 115}, ${adminPrimaryRgb?.b || 22}, 0.1);
      
      /* Chart Colors */
      --chart-1: ${website.primaryColor};
      --chart-2: ${website.secondaryColor};
      --chart-3: #8b5cf6;
      --chart-4: #22c55e;
      --chart-5: #ec4899;
      
      /* Feature Flags */
      --enable-neon: ${website.enableNeonEffects ? "1" : "0"};
      --enable-orbs: ${website.enableAnimatedOrbs ? "1" : "0"};
      --enable-glass: ${website.enableGlassmorphism ? "1" : "0"};
    }
    
    /* Override hardcoded background colors */
    .bg-\\[\\#030712\\] {
      background-color: var(--background) !important;
    }
    
    /* Override orange-500 text and backgrounds */
    .text-orange-500 {
      color: var(--primary) !important;
    }
    
    .bg-orange-500 {
      background-color: var(--primary) !important;
    }
    
    .border-orange-500 {
      border-color: var(--primary) !important;
    }
    
    .border-orange-500\\/30 {
      border-color: rgba(var(--primary-rgb), 0.3) !important;
    }
    
    .from-orange-500 {
      --tw-gradient-from: var(--primary) !important;
    }
    
    .to-red-600, .to-red-500 {
      --tw-gradient-to: var(--secondary-color) !important;
    }
    
    .via-red-500 {
      --tw-gradient-via: var(--secondary-color) !important;
    }
    
    /* Orb colors override */
    .orb-orange {
      background: radial-gradient(circle, var(--primary) 0%, transparent 70%) !important;
    }
    
    .orb-cyan {
      background: radial-gradient(circle, var(--secondary-color) 0%, transparent 70%) !important;
    }
    
    /* Button gradients */
    .btn-futuristic.bg-gradient-to-r.from-orange-500 {
      background-image: linear-gradient(to right, var(--primary), var(--secondary-color)) !important;
    }
    
    /* Neon glow effect with dynamic color */
    .neon-glow {
      box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3),
                  0 0 40px rgba(var(--primary-rgb), 0.2),
                  0 0 60px rgba(var(--primary-rgb), 0.1) !important;
    }
    
    /* Admin sidebar gradient */
    .from-orange-500.to-red-600 {
      --tw-gradient-from: var(--admin-primary) !important;
      --tw-gradient-to: var(--admin-accent) !important;
    }
    
    /* Main page background override */
    .min-h-screen {
      background-color: var(--background) !important;
    }
    
    /* Apply mode-specific styles */
    ${isDark ? `
      body {
        color-scheme: dark;
        background-color: ${website.backgroundColor} !important;
      }
      
      html {
        background-color: ${website.backgroundColor} !important;
      }
    ` : `
      /* ========== LIGHT MODE COMPREHENSIVE OVERRIDES ========== */
      
      html, body {
        color-scheme: light;
        background-color: ${website.backgroundColor} !important;
        color: #1e293b !important;
      }
      
      /* ===== BACKGROUND OVERRIDES ===== */
      .min-h-screen,
      .min-h-screen.bg-\\[\\#030712\\],
      .bg-\\[\\#030712\\],
      [class*="bg-[#0"] {
        background-color: ${website.backgroundColor} !important;
      }
      
      .bg-gray-900, .bg-gray-800, .bg-gray-950 {
        background-color: #f8fafc !important;
      }
      
      .bg-gray-900\\/50, .bg-gray-800\\/50, .bg-gray-900\\/80 {
        background-color: rgba(248, 250, 252, 0.9) !important;
      }
      
      .bg-white\\/5, .bg-white\\/10, .bg-white\\/20 {
        background-color: rgba(0, 0, 0, 0.03) !important;
      }
      
      /* ===== TEXT COLOR OVERRIDES ===== */
      .text-white {
        color: #0f172a !important;
      }
      
      .text-gray-100, .text-gray-200 {
        color: #1e293b !important;
      }
      
      .text-gray-300 {
        color: #475569 !important;
      }
      
      .text-gray-400 {
        color: #64748b !important;
      }
      
      .text-gray-500 {
        color: #94a3b8 !important;
      }
      
      h1, h2, h3, h4, h5, h6, p, span, div {
        color: inherit;
      }
      
      /* Force dark text on main content */
      .min-h-screen .text-white,
      section .text-white {
        color: #0f172a !important;
      }
      
      /* ===== BORDER OVERRIDES ===== */
      .border-gray-700, .border-gray-800, .border-gray-900 {
        border-color: #e2e8f0 !important;
      }
      
      .border-white\\/10, .border-white\\/20, .border-white\\/5 {
        border-color: rgba(0, 0, 0, 0.08) !important;
      }
      
      /* ===== GLASS EFFECT OVERRIDES ===== */
      .glass {
        background: rgba(255, 255, 255, 0.85) !important;
        border-color: rgba(0, 0, 0, 0.08) !important;
        color: #0f172a !important;
        backdrop-filter: blur(12px) !important;
      }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border-color: rgba(0, 0, 0, 0.08) !important;
        color: #0f172a !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
      }
      
      .glass-card:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06) !important;
      }
      
      /* ===== CARD OVERRIDES ===== */
      [class*="rounded-"][class*="glass-card"],
      [class*="rounded-"][class*="bg-gray-900"],
      [class*="rounded-"][class*="bg-gray-800"] {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* ===== BACKGROUND DECORATIONS ===== */
      .orb-orange, .orb-cyan, .orb-purple, .orb {
        opacity: 0.15 !important;
        filter: blur(100px) !important;
      }
      
      .bg-grid-pattern {
        opacity: 0.03 !important;
      }
      
      .fixed.inset-0.pointer-events-none {
        opacity: 0.5 !important;
      }
      
      /* ===== BUTTON OVERRIDES ===== */
      .btn-futuristic {
        color: #ffffff !important;
      }
      
      button[class*="border-gray-700"],
      button[class*="border-gray-800"] {
        border-color: #e2e8f0 !important;
        color: #334155 !important;
      }
      
      button[class*="hover:bg-white\\/5"]:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      /* ===== GRADIENT TEXT ===== */
      .bg-gradient-to-r.bg-clip-text.text-transparent {
        filter: saturate(1.2) !important;
      }
      
      /* ===== HEADER/NAV OVERRIDES ===== */
      header.glass, nav.glass {
        background: rgba(255, 255, 255, 0.9) !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
      }
      
      header a, nav a {
        color: #334155 !important;
      }
      
      header a:hover, nav a:hover {
        color: var(--primary) !important;
      }
      
      /* ===== BADGE OVERRIDES ===== */
      .rounded-full.glass {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #334155 !important;
      }
      
      /* ===== ICON OVERRIDES ===== */
      .text-orange-500 svg, svg.text-orange-500 {
        color: var(--primary) !important;
      }
      
      /* ===== FORM INPUTS ===== */
      input, textarea, select {
        background-color: #ffffff !important;
        border-color: #e2e8f0 !important;
        color: #0f172a !important;
      }
      
      input::placeholder, textarea::placeholder {
        color: #94a3b8 !important;
      }
      
      /* ===== ADMIN PANEL OVERRIDES ===== */
      aside.glass {
        background: rgba(255, 255, 255, 0.95) !important;
        border-right: 1px solid #e2e8f0 !important;
      }
      
      aside .text-gray-400, aside .text-gray-500 {
        color: #64748b !important;
      }
      
      aside a:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      /* ===== DROPDOWN/MENU OVERRIDES ===== */
      [role="menu"], [data-radix-menu-content] {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
      }
      
      /* ===== SCROLLBAR FOR LIGHT MODE ===== */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `}
    
    /* Disable effects based on settings */
    ${!website.enableNeonEffects ? `
      .neon-glow, .neon-text {
        text-shadow: none !important;
        box-shadow: none !important;
      }
    ` : ""}
    
    ${!website.enableAnimatedOrbs ? `
      .orb-orange, .orb-cyan, .orb-purple, .orb {
        display: none !important;
      }
    ` : ""}
    
    ${!website.enableGlassmorphism ? `
      .glass, .glass-card {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background: ${isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"} !important;
      }
    ` : ""}
  `;
}

// Context type
interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateAdminTheme: (updates: Partial<AdminTheme>) => void;
  updateWebsiteTheme: (updates: Partial<WebsiteTheme>) => void;
  applyPreset: (preset: ThemePreset) => void;
  presets: ThemePreset[];
  isLoading: boolean;
  saveTheme: () => Promise<void>;
  isDirty: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultThemeConfig);
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(defaultThemeConfig);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Load theme from API
  useEffect(() => {
    async function loadTheme() {
      try {
        // Load presets
        const presetsRes = await fetch("/api/theme/presets");
        if (presetsRes.ok) {
          const presetsData = await presetsRes.json();
          setPresets(presetsData);
        }

        // Load saved theme from settings
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          // API returns { success: true, settings: { theme_config: ... } }
          const themeConfig = data.settings?.theme_config || data.theme_config;
          if (themeConfig) {
            const loadedTheme: ThemeConfig = {
              ...defaultThemeConfig,
              ...themeConfig,
              admin: { ...defaultThemeConfig.admin, ...themeConfig.admin },
              website: { ...defaultThemeConfig.website, ...themeConfig.website },
            };
            console.log("Loaded theme:", loadedTheme); // Debug log
            setThemeState(loadedTheme);
            setSavedTheme(loadedTheme);
          }
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, []);

  // Inject CSS variables when theme changes
  useEffect(() => {
    const styleId = "theme-variables";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const cssContent = generateCSSVariables(theme);
    styleEl.textContent = cssContent;
    console.log("Theme applied:", theme.mode, theme.website.primaryColor); // Debug log

    // Update body class for mode
    document.body.classList.remove("light-mode", "dark-mode");
    const effectiveMode =
      theme.mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme.mode;
    document.body.classList.add(`${effectiveMode}-mode`);

    return () => {
      // Don't remove on cleanup - keep theme persistent
    };
  }, [theme]);

  // Check if theme has changed
  useEffect(() => {
    setIsDirty(JSON.stringify(theme) !== JSON.stringify(savedTheme));
  }, [theme, savedTheme]);

  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setThemeState(newTheme);
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setThemeState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateAdminTheme = useCallback((updates: Partial<AdminTheme>) => {
    setThemeState((prev) => ({
      ...prev,
      admin: { ...prev.admin, ...updates },
    }));
  }, []);

  const updateWebsiteTheme = useCallback((updates: Partial<WebsiteTheme>) => {
    setThemeState((prev) => ({
      ...prev,
      website: { ...prev.website, ...updates },
    }));
  }, []);

  const applyPreset = useCallback((preset: ThemePreset) => {
    setThemeState({
      ...preset.theme_config,
      preset: preset.slug,
    });
  }, []);

  const saveTheme = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_config: theme }),
      });

      if (res.ok) {
        setSavedTheme(theme);
        setIsDirty(false);
      } else {
        throw new Error("Failed to save theme");
      }
    } catch (error) {
      console.error("Failed to save theme:", error);
      throw error;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        updateTheme,
        updateAdminTheme,
        updateWebsiteTheme,
        applyPreset,
        presets,
        isLoading,
        saveTheme,
        isDirty,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for accessing theme without requiring provider (for static pages)
export function useThemeConfig(): ThemeConfig {
  const context = useContext(ThemeContext);
  return context?.theme ?? defaultThemeConfig;
}
