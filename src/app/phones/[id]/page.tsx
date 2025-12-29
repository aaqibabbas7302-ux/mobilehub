import Link from "next/link";
import { Phone, MapPin, MessageCircle, ArrowLeft, Shield, Battery, Camera, Fingerprint, Volume2, Wifi, Bluetooth, Check, X, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, calculateDiscount, getWhatsAppLink, generateInquiryMessage, CONDITION_DESCRIPTIONS } from "@/lib/utils";

// Phone type definition
interface PhoneDetail {
  id: string;
  brand: string;
  model_name: string;
  variant: string;
  color: string;
  condition_grade: string;
  battery_health_percent: number;
  selling_price_paise: number;
  original_mrp_paise: number;
  warranty_type: string;
  status: string;
  images: string[];
  imei_verified: boolean;
  screen_condition: string;
  body_condition: string;
  face_id_working: boolean;
  fingerprint_working: boolean;
  buttons_working: boolean;
  speakers_working: boolean;
  microphone_working: boolean;
  cameras_working: string;
  wifi_working: boolean;
  bluetooth_working: boolean;
  charging_port_condition: string;
  accessories_included: string[];
  location: string;
}

// Mock data - in production, fetch from Supabase
const phonesData: Record<string, PhoneDetail> = {
  "1": {
    id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight",
    condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900,
    original_mrp_paise: 7990000, warranty_type: "60 Days", status: "Available",
    images: [
      "https://placehold.co/600x600/1a1a1a/white?text=iPhone+13",
      "https://placehold.co/600x600/2a2a2a/white?text=Back+View",
      "https://placehold.co/600x600/3a3a3a/white?text=Side+View",
    ],
    imei_verified: true,
    screen_condition: "Perfect",
    body_condition: "Excellent",
    face_id_working: true,
    fingerprint_working: false,
    buttons_working: true,
    speakers_working: true,
    microphone_working: true,
    cameras_working: "Both",
    wifi_working: true,
    bluetooth_working: true,
    charging_port_condition: "Good",
    accessories_included: ["Charger", "Box"],
    location: "Store",
  },
};

const getPhone = (id: string): PhoneDetail => {
  return phonesData[id] || phonesData["1"];
};

const WHATSAPP_NUMBER = "919876543210";

export default async function PhoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const phone = getPhone(id);
  const discount = calculateDiscount(phone.original_mrp_paise, phone.selling_price_paise);
  const inquiryMessage = generateInquiryMessage(phone);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">MobileHub</span>
                <span className="text-xs text-gray-500 block -mt-1">Delhi</span>
              </div>
            </Link>
            
            <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/phones" className="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Phones
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phone.images[0]}
                alt={`${phone.brand} ${phone.model_name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {phone.images.map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer hover:border-blue-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={phone.condition_grade === 'A+' ? 'bg-emerald-500' : phone.condition_grade === 'A' ? 'bg-green-500' : 'bg-yellow-500'}>
                  Grade {phone.condition_grade}
                </Badge>
                {phone.imei_verified && (
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                    <Shield className="w-3 h-3 mr-1" /> IMEI Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {phone.brand} {phone.model_name}
              </h1>
              <p className="text-gray-600 mt-1">{phone.variant} • {phone.color}</p>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(phone.selling_price_paise)}
                  </p>
                  {phone.original_mrp_paise && (
                    <p className="text-lg text-gray-400 line-through">
                      MRP {formatPrice(phone.original_mrp_paise)}
                    </p>
                  )}
                </div>
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Battery className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Battery Health</p>
                  <p className="font-semibold text-gray-900">{phone.battery_health_percent}%</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warranty</p>
                  <p className="font-semibold text-gray-900">{phone.warranty_type}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={getWhatsAppLink(WHATSAPP_NUMBER, inquiryMessage)} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enquire on WhatsApp
                </Button>
              </a>
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                7-Day Replacement
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                GST Invoice
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Quality Tested
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Condition Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Condition Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition Grade</span>
                  <span className="font-medium">{phone.condition_grade} - {CONDITION_DESCRIPTIONS[phone.condition_grade]?.split(' - ')[0]}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Screen Condition</span>
                  <span className="font-medium">{phone.screen_condition}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Body Condition</span>
                  <span className="font-medium">{phone.body_condition}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Battery Health</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${phone.battery_health_percent >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${phone.battery_health_percent}%` }}
                      />
                    </div>
                    <span className="font-medium">{phone.battery_health_percent}%</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Accessories</span>
                  <span className="font-medium">{phone.accessories_included?.join(", ") || "None"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Functional Tests */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Functional Tests</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Cameras</span>
                  <span className="ml-auto font-medium text-green-600">{phone.cameras_working}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Face ID</span>
                  {phone.face_id_working ? (
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  ) : (
                    <X className="ml-auto w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Speakers</span>
                  {phone.speakers_working ? (
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  ) : (
                    <X className="ml-auto w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Wifi className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">WiFi</span>
                  {phone.wifi_working ? (
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  ) : (
                    <X className="ml-auto w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Bluetooth className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Bluetooth</span>
                  {phone.bluetooth_working ? (
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  ) : (
                    <X className="ml-auto w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Buttons</span>
                  {phone.buttons_working ? (
                    <Check className="ml-auto w-5 h-5 text-green-500" />
                  ) : (
                    <X className="ml-auto w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Visit Our Store</h4>
                  <p className="text-gray-600">Nehru Place, New Delhi - 110019</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  10 AM - 8 PM (Mon-Sat)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(phone.selling_price_paise)}</p>
            <p className="text-sm text-gray-500">{phone.warranty_type} Warranty</p>
          </div>
          <a href={getWhatsAppLink(WHATSAPP_NUMBER, inquiryMessage)} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-5 h-5 mr-2" />
              Enquire Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
