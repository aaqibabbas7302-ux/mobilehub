"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Phone, 
  MessageCircle, 
  ArrowLeft,
  Shield,
  Battery,
  HardDrive,
  Palette,
  Check,
  ChevronRight,
  Share2,
  Heart,
  Award,
  Clock,
  Truck,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getWhatsAppLink, getConditionColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const WHATSAPP_NUMBER = "919910724940";

interface PhoneDetail {
  id: string;
  brand: string;
  model_name: string;
  model_number: string | null;
  variant: string | null;
  color: string | null;
  condition_grade: string;
  battery_health_percent: number | null;
  selling_price: number;
  cost_price: number;
  original_mrp: number | null;
  images: string[] | null;
  status: string;
  warranty_type: string | null;
  imei_1: string;
  accessories_included: string[] | null;
  description: string | null;
  created_at: string;
}

const conditionLabels: Record<string, string> = {
  "A+": "Like New",
  "A": "Excellent",
  "B+": "Very Good",
  "B": "Good",
  "C": "Fair",
  "D": "Acceptable",
};

const gradients = [
  "from-violet-600 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-red-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
];

export default function PhoneDetailPage() {
  const params = useParams();
  const [phone, setPhone] = useState<PhoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPhone(params.id as string);
    }
  }, [params.id]);

  const fetchPhone = async (id: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("phones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPhone(data);
    } catch (err) {
      console.error("Error fetching phone:", err);
      setError("Phone not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !phone) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Phone not found</h1>
        <Link href="/phones">
          <Button className="btn-futuristic rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Phones
          </Button>
        </Link>
      </div>
    );
  }

  const price = phone.selling_price;
  const originalPrice = phone.original_mrp || null;
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const condition = conditionLabels[phone.condition_grade] || phone.condition_grade;
  const gradient = gradients[phone.brand.length % gradients.length];
  const images = phone.images || [];

  const whatsappMessage = `Hi! I'm interested in buying the ${phone.model_name} (${phone.variant || ""}) for ${formatPrice(price)}. Is it available?`;

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/phones">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold hidden sm:block">
                Mobile<span className="text-orange-500">Hub</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-orange-500">{phone.model_name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className={`relative bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden aspect-square`}>
              {images.length > 0 ? (
                <img 
                  src={images[selectedImage]} 
                  alt={phone.model_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[200px]">📱</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <Badge className={`${getConditionColor(condition)} border-0 text-sm px-3 py-1`}>
                  {condition}
                </Badge>
                {discount > 0 && (
                  <Badge className="bg-green-500/90 text-white border-0 text-sm px-3 py-1">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Battery */}
              {phone.battery_health_percent && (
                <div className="absolute bottom-6 left-6 glass rounded-full px-4 py-2 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{phone.battery_health_percent}%</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                      selectedImage === i ? 'ring-2 ring-orange-500' : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-0">{phone.brand}</Badge>
                {phone.status === "Available" && (
                  <Badge className="bg-green-500/20 text-green-500 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{phone.model_name}</h1>
              <p className="text-gray-400 text-lg">{phone.variant} {phone.color ? `• ${phone.color}` : ""}</p>
              
              <div className="flex items-baseline gap-4 mt-6">
                <span className="text-5xl font-bold text-orange-500">{formatPrice(price)}</span>
                {originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                )}
              </div>
              {originalPrice && (
                <p className="text-green-400 text-sm mt-2">
                  You save {formatPrice(originalPrice - price)} ({discount}% off)
                </p>
              )}
            </div>

            {/* Specifications */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Storage</p>
                    <p className="font-medium">{phone.variant || "N/A"}</p>
                  </div>
                </div>
                {phone.battery_health_percent && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Battery className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Battery Health</p>
                      <p className="font-medium">{phone.battery_health_percent}%</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="font-medium">{phone.color || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Condition</p>
                    <p className="font-medium">{condition}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className="text-xs text-gray-400">{phone.warranty_type || "Seller Warranty"}</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <RefreshCw className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className="text-xs text-gray-400">7 Day Returns</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Truck className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                <p className="text-xs text-gray-400">Delhi NCR Delivery</p>
              </div>
            </div>

            {/* Included Accessories */}
            {phone.accessories_included && phone.accessories_included.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">What&apos;s Included</h3>
                <div className="flex flex-wrap gap-2">
                  {phone.accessories_included.map((item, i) => (
                    <Badge key={i} variant="outline" className="border-gray-700">
                      <Check className="w-3 h-3 mr-1 text-green-500" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {phone.description && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">Description</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{phone.description}</p>
              </div>
            )}

            {/* Additional Details */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">Device Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Brand</p>
                  <p className="font-medium">{phone.brand}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-medium">{phone.model_name}</p>
                </div>
                {phone.model_number && (
                  <div>
                    <p className="text-gray-500">Model Number</p>
                    <p className="font-medium">{phone.model_number}</p>
                  </div>
                )}
                {phone.variant && (
                  <div>
                    <p className="text-gray-500">Storage</p>
                    <p className="font-medium">{phone.variant}</p>
                  </div>
                )}
                {phone.color && (
                  <div>
                    <p className="text-gray-500">Color</p>
                    <p className="font-medium">{phone.color}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Condition</p>
                  <p className="font-medium">{condition}</p>
                </div>
                {phone.battery_health_percent && (
                  <div>
                    <p className="text-gray-500">Battery Health</p>
                    <p className="font-medium text-green-500">{phone.battery_health_percent}%</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Warranty</p>
                  <p className="font-medium">{phone.warranty_type || "Seller Warranty"}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)} className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl text-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Buy via WhatsApp
                </Button>
              </a>
              <a href={`tel:+91${WHATSAPP_NUMBER.slice(2)}`} className="flex-1">
                <Button variant="outline" className="w-full border-gray-800 py-6 rounded-xl text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#030712]/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-orange-500">{formatPrice(price)}</p>
            {originalPrice && (
              <p className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</p>
            )}
          </div>
          <a href={getWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)} className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl">
              <MessageCircle className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
