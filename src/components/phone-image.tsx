"use client";

import { CldImage } from "next-cloudinary";
import { useState } from "react";

interface PhoneImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackGradient?: string;
  showEmoji?: boolean;
  emojiSize?: string;
  fill?: boolean;
}

const DEFAULT_GRADIENTS = [
  "from-violet-600 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-amber-600",
];

export function PhoneImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = "",
  priority = false,
  fallbackGradient,
  showEmoji = true,
  emojiSize = "text-8xl",
  fill = false,
}: PhoneImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get a consistent gradient based on the alt text
  const getGradient = () => {
    if (fallbackGradient) return fallbackGradient;
    const hash = alt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_GRADIENTS[hash % DEFAULT_GRADIENTS.length];
  };

  // Check if src is a valid Cloudinary URL
  const isCloudinaryUrl = src?.includes("cloudinary.com") || src?.includes("res.cloudinary.com");
  const isExternalUrl = src?.startsWith("http://") || src?.startsWith("https://");

  // If we have a valid Cloudinary image and no error
  if (src && isCloudinaryUrl && !imageError) {
    // Extract public_id from Cloudinary URL
    const publicId = src.split("/upload/").pop()?.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "") || src;
    
    return (
      <CldImage
        src={publicId}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        priority={priority}
        fill={fill}
        crop="fill"
        gravity="auto"
        onError={() => setImageError(true)}
      />
    );
  }

  // If external URL (not Cloudinary)
  if (src && isExternalUrl && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        onError={() => setImageError(true)}
        style={fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined}
      />
    );
  }

  // Fallback: Show gradient with phone emoji
  return (
    <div 
      className={`bg-gradient-to-br ${getGradient()} flex items-center justify-center ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {showEmoji && (
        <span className={`${emojiSize} drop-shadow-2xl`}>📱</span>
      )}
    </div>
  );
}

// Gallery component for multiple images
interface PhoneGalleryProps {
  images: string[];
  alt: string;
  fallbackGradient?: string;
}

export function PhoneGallery({ images, alt, fallbackGradient }: PhoneGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If no images, show fallback
  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <PhoneImage
          alt={alt}
          fallbackGradient={fallbackGradient}
          className="w-full aspect-square rounded-3xl"
          emojiSize="text-[200px]"
        />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${fallbackGradient || "from-gray-700 to-gray-900"} opacity-60 flex items-center justify-center`}
            >
              <span className="text-4xl">📱</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden">
        <PhoneImage
          src={images[selectedIndex]}
          alt={`${alt} - Image ${selectedIndex + 1}`}
          fallbackGradient={fallbackGradient}
          className="w-full h-full object-cover"
          fill
          priority
          emojiSize="text-[200px]"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                selectedIndex === i ? "ring-2 ring-orange-500" : "opacity-60 hover:opacity-80"
              }`}
            >
              <PhoneImage
                src={img}
                alt={`${alt} thumbnail ${i + 1}`}
                fallbackGradient={fallbackGradient}
                className="w-full h-full object-cover"
                fill
                showEmoji={true}
                emojiSize="text-4xl"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
