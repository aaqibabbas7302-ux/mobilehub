"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pipette } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
}

const defaultPresets = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#22c55e", // Green
  "#eab308", // Yellow
  "#ffffff", // White
  "#71717a", // Gray
  "#000000", // Black
];

export function ColorPicker({
  color,
  onChange,
  label,
  presetColors = defaultPresets,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleInputBlur = () => {
    // Reset to current color if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      setInputValue(color);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="flex items-center gap-2">
        {/* Color Swatch Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border border-white/10 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0 relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdHRlcm4gaWQ9ImNoZWNrIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2RkZCIvPjxyZWN0IHg9IjQiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIwIiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2hlY2spIi8+PC9zdmc+')] -z-10" />
        </button>

        {/* Hex Input */}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          className="w-28 font-mono text-sm bg-white/5 border-white/10"
          placeholder="#000000"
        />

        {/* Native Color Picker */}
        <input
          ref={colorInputRef}
          type="color"
          value={color}
          onChange={handleColorInputChange}
          className="sr-only"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => colorInputRef.current?.click()}
          className="bg-white/5 border-white/10 hover:bg-white/10"
        >
          <Pipette className="w-4 h-4" />
        </Button>
      </div>

      {/* Dropdown with presets */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 bg-gray-900 border border-white/10 rounded-xl shadow-xl">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => {
                  onChange(presetColor);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-lg border transition-all hover:scale-110 ${
                  color === presetColor
                    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                    : "border-white/10"
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-gray-500">Custom:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              className="w-6 h-6 cursor-pointer rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function ColorPickerInline({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="relative w-8 h-8 rounded-lg border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden"
      onClick={() => inputRef.current?.click()}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}
