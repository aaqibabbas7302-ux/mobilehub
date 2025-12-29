# Cloudinary Integration for MobileHub Delhi

This project uses Cloudinary for image storage and optimization.

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. Navigate to your Dashboard to find your credentials

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Create an Upload Preset (Required for Widget)

1. Go to **Settings** → **Upload** in your Cloudinary dashboard
2. Scroll to **Upload presets** and click **Add upload preset**
3. Configure:
   - **Preset name**: `mobilehub_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `mobilehub-delhi`
   - Under **Upload manipulations**, set:
     - Format: `Auto`
     - Quality: `Auto`
4. Click **Save**

### 4. Set Up Upload Restrictions (Recommended)

In your upload preset settings, configure:
- **Allowed formats**: `jpg, jpeg, png, webp`
- **Max file size**: `10 MB`
- **Max image dimensions**: `4096 x 4096`

## Usage in Components

### CloudinaryUpload Component

```tsx
import { CloudinaryUpload } from "@/components/cloudinary-upload";

<CloudinaryUpload
  onUpload={(urls) => console.log("Uploaded:", urls)}
  folder="mobilehub-delhi/phones"
  maxFiles={5}
/>
```

### PhoneImage Component

```tsx
import { PhoneImage, PhoneGallery } from "@/components/phone-image";

// Single image with automatic fallback
<PhoneImage
  src="https://res.cloudinary.com/your-cloud/image/upload/v1234/phone.jpg"
  alt="iPhone 15 Pro Max"
  width={400}
  height={400}
/>

// Gallery with thumbnails
<PhoneGallery
  images={[
    "cloudinary-url-1",
    "cloudinary-url-2",
    "cloudinary-url-3",
  ]}
  alt="Phone Name"
  fallbackGradient="from-violet-600 to-purple-600"
/>
```

## Image Transformation Features

Cloudinary automatically:
- Optimizes image quality and format (WebP/AVIF where supported)
- Resizes images for different screen sizes
- Lazy loads images for performance
- Provides CDN delivery for fast global access

## Folder Structure in Cloudinary

```
mobilehub-delhi/
├── phones/         # All phone product images
├── brands/         # Brand logos
├── store/          # Store images
└── misc/           # Other images
```

## Troubleshooting

### Upload Not Working?
- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
- Ensure the upload preset `mobilehub_unsigned` exists and is set to unsigned
- Check browser console for CORS errors

### Images Not Loading?
- Verify the cloud name in the URL matches your account
- Check if the image exists in your Cloudinary media library
- Ensure the image format is supported
