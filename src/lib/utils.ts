// Utility functions for MobileHub Delhi

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert paise to INR display format
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Convert INR to paise for storage
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Convert paise to INR for display/forms
export function toRupees(paise: number): number {
  return paise / 100;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MH${year}${month}${random}`;
}

// Get condition badge color
export function getConditionColor(grade: string): string {
  const colors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-white',
    'A': 'bg-green-500 text-white',
    'B+': 'bg-lime-500 text-white',
    'B': 'bg-yellow-500 text-black',
    'C': 'bg-orange-500 text-white',
    'D': 'bg-red-500 text-white',
  };
  return colors[grade] || 'bg-gray-500 text-white';
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800 border-green-200',
    'Reserved': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Sold': 'bg-blue-100 text-blue-800 border-blue-200',
    'Under Repair': 'bg-orange-100 text-orange-800 border-orange-200',
    'Quality Check': 'bg-purple-100 text-purple-800 border-purple-200',
    'Listed Online': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Calculate discount percentage
export function calculateDiscount(originalPaise: number, sellingPaise: number): number {
  if (!originalPaise || originalPaise <= sellingPaise) return 0;
  return Math.round(((originalPaise - sellingPaise) / originalPaise) * 100);
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

// Popular brands for Indian market
export const POPULAR_BRANDS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'Realme',
  'Google',
  'Nothing',
  'Motorola',
  'iQOO',
  'Poco',
] as const;

// Condition grade descriptions
export const CONDITION_DESCRIPTIONS: Record<string, string> = {
  'A+': 'Like New - No visible scratches or marks',
  'A': 'Excellent - Minor signs of use, barely visible',
  'B+': 'Very Good - Light scratches, good overall condition',
  'B': 'Good - Visible wear, fully functional',
  'C': 'Fair - Heavy wear, minor issues possible',
  'D': 'Poor - Significant wear, sold as-is',
};

// WhatsApp link generator
export function getWhatsAppLink(phone: string, message?: string): string {
  const baseUrl = 'https://wa.me/';
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : (phone.startsWith('91') ? phone : `91${phone}`);
  const url = `${baseUrl}${formattedPhone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

// Generate WhatsApp inquiry message
export function generateInquiryMessage(phone: { brand: string; model_name: string; variant?: string; selling_price_paise: number }): string {
  return `Hi! I'm interested in the ${phone.brand} ${phone.model_name}${phone.variant ? ` (${phone.variant})` : ''} listed at ${formatPrice(phone.selling_price_paise)}. Is it still available?`;
}
