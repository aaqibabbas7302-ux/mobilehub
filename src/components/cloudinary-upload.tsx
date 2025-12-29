"use client";

import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface CloudinaryUploadProps {
  onUpload: (urls: string[]) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  existingImages?: string[];
  onRemove?: (url: string) => void;
}

export function CloudinaryUpload({
  onUpload,
  folder = "mobilehub-delhi/phones",
  multiple = true,
  maxFiles = 5,
  existingImages = [],
  onRemove,
}: CloudinaryUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);

  const handleUpload = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info !== "string") {
      const secureUrl = result.info.secure_url;
      const newImages = [...images, secureUrl];
      setImages(newImages);
      onUpload(newImages);
    }
  };

  const handleRemove = (url: string) => {
    const newImages = images.filter((img) => img !== url);
    setImages(newImages);
    onRemove?.(url);
    onUpload(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxFiles && (
        <CldUploadWidget
          uploadPreset="mobilehub_unsigned"
          options={{
            folder,
            multiple,
            maxFiles: maxFiles - images.length,
            sources: ["local", "camera", "url"],
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 10000000, // 10MB
            cropping: true,
            croppingAspectRatio: 1,
            croppingShowDimensions: true,
            showSkipCropButton: true,
            styles: {
              palette: {
                window: "#1F2937",
                windowBorder: "#374151",
                tabIcon: "#F97316",
                menuIcons: "#9CA3AF",
                textDark: "#1F2937",
                textLight: "#F3F4F6",
                link: "#F97316",
                action: "#F97316",
                inactiveTabIcon: "#6B7280",
                error: "#EF4444",
                inProgress: "#F97316",
                complete: "#10B981",
                sourceBg: "#111827",
              },
            },
          }}
          onSuccess={handleUpload}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-orange-500/50 transition-colors bg-white/5 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Upload className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or WebP (max 10MB)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {images.length}/{maxFiles} images uploaded
                  </p>
                </div>
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ImageIcon className="w-4 h-4" />
          <span>First image will be used as the primary image</span>
        </div>
      )}
    </div>
  );
}
