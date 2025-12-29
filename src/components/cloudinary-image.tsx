"use client";

import { CldImage } from "next-cloudinary";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  crop?: "fill" | "fit" | "scale" | "crop" | "thumb" | "pad" | "limit";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  crop = "fill",
  gravity = "auto",
}: CloudinaryImageProps) {
  // If it's a full URL (external image), use regular img tag
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        style={fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined}
      />
    );
  }

  // If it's a Cloudinary public ID
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      fill={fill}
      crop={crop}
      gravity={gravity}
    />
  );
}
