import Link from "next/link";
import { Phone, MapPin, Clock, Shield, Award, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, calculateDiscount, getWhatsAppLink } from "@/lib/utils";

// Mock data - replace with Supabase
const featuredPhones = [
  { 
    id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight", 
    condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900, 
    original_mrp_paise: 7990000, warranty_type: "60 Days", status: "Available",
    images: ["https://placehold.co/400x400/1a1a1a/white?text=iPhone+13"]
  },
  { 
    id: "2", brand: "Samsung", model_name: "Galaxy S23", variant: "8GB/256GB", color: "Phantom Black",
    condition_grade: "A", battery_health_percent: 88, selling_price_paise: 4899900, 
    original_mrp_paise: 7499900, warranty_type: "30 Days", status: "Available",
    images: ["https://placehold.co/400x400/1a1a1a/white?text=Galaxy+S23"]
  },
  { 
    id: "3", brand: "OnePlus", model_name: "11R 5G", variant: "8GB/128GB", color: "Sonic Black",
    condition_grade: "A+", battery_health_percent: 95, selling_price_paise: 3199900, 
    original_mrp_paise: 3999900, warranty_type: "60 Days", status: "Available",
    images: ["https://placehold.co/400x400/1a1a1a/white?text=OnePlus+11R"]
  },
  { 
    id: "4", brand: "Apple", model_name: "iPhone 14 Pro", variant: "256GB", color: "Deep Purple",
    condition_grade: "A", battery_health_percent: 90, selling_price_paise: 8999900, 
    original_mrp_paise: 12990000, warranty_type: "90 Days", status: "Available",
    images: ["https://placehold.co/400x400/1a1a1a/white?text=iPhone+14+Pro"]
  },
];

const brands = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme"];

const WHATSAPP_NUMBER = "919876543210";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/phones" className="text-gray-600 hover:text-gray-900 font-medium">
                All Phones
              </Link>
              <Link href="/brands" className="text-gray-600 hover:text-gray-900 font-medium">
                Brands
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white border-0 mb-4">
              🇮🇳 Delhi&apos;s Trusted Second-Hand Mobile Store
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Premium Pre-Owned Phones at <span className="text-yellow-300">Unbeatable Prices</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mt-6 max-w-2xl">
              Quality-checked smartphones with warranty. Every phone IMEI verified, 
              battery tested, and backed by our 7-day replacement guarantee.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/phones">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                  Browse Phones
                </Button>
              </Link>
              <a href={getWhatsAppLink(WHATSAPP_NUMBER, "Hi! I want to buy a second-hand phone")} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-300" />
                <span>IMEI Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-300" />
                <span>Quality Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-200" />
                <span>All India Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-300" />
                <span>Nehru Place, Delhi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Shop by Brand</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <Link 
                key={brand} 
                href={`/phones?brand=${brand}`}
                className="px-6 py-3 bg-white rounded-full border hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Phones */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Phones</h2>
              <p className="text-gray-600 mt-1">Top quality phones at best prices</p>
            </div>
            <Link href="/phones">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPhones.map((phone) => {
              const discount = calculateDiscount(phone.original_mrp_paise, phone.selling_price_paise);
              
              return (
                <Card key={phone.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={phone.images[0]} 
                      alt={`${phone.brand} ${phone.model_name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        {discount}% OFF
                      </Badge>
                    )}
                    <Badge 
                      className={`absolute top-3 right-3 ${
                        phone.condition_grade === 'A+' ? 'bg-emerald-500' :
                        phone.condition_grade === 'A' ? 'bg-green-500' : 'bg-yellow-500'
                      } text-white`}
                    >
                      Grade {phone.condition_grade}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {phone.brand} {phone.model_name}
                        </h3>
                        <p className="text-sm text-gray-500">{phone.variant} • {phone.color}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>🔋 {phone.battery_health_percent}%</span>
                      <span>•</span>
                      <span>📦 {phone.warranty_type} Warranty</span>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(phone.selling_price_paise)}
                        </p>
                        {phone.original_mrp_paise && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(phone.original_mrp_paise)}
                          </p>
                        )}
                      </div>
                      <Link href={`/phones/${phone.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose MobileHub Delhi?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IMEI Verified</h3>
              <p className="text-gray-600 text-sm">Every phone checked on CEIR portal. No stolen or blacklisted phones.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Tested</h3>
              <p className="text-gray-600 text-sm">32-point quality check. Battery, screen, and all functions tested.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pan India Delivery</h3>
              <p className="text-gray-600 text-sm">Free shipping across India. Safe packaging guaranteed.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
              <p className="text-gray-600 text-sm">24/7 support on WhatsApp. Ask anything before buying.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Tell us your budget and preferred phone. Our AI assistant will help you 
            find the perfect phone from our inventory!
          </p>
          <a href={getWhatsAppLink(WHATSAPP_NUMBER, "Hi! I'm looking for a phone. Can you help me?")} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with AI on WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">MobileHub Delhi</span>
              </div>
              <p className="text-sm">
                Delhi&apos;s most trusted destination for quality pre-owned smartphones. 
                Every phone quality tested with warranty.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/phones" className="hover:text-white">All Phones</Link></li>
                <li><Link href="/phones?brand=Apple" className="hover:text-white">iPhones</Link></li>
                <li><Link href="/phones?brand=Samsung" className="hover:text-white">Samsung</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nehru Place, New Delhi
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  10 AM - 8 PM (Mon-Sat)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Trust & Safety</h4>
              <ul className="space-y-2 text-sm">
                <li>✅ GSTIN: 07XXXXX1234X1ZX</li>
                <li>✅ IMEI Verified Phones</li>
                <li>✅ 7-Day Replacement</li>
                <li>✅ Secure Payments</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2024 MobileHub Delhi. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Fixed WhatsApp Button */}
      <a 
        href={getWhatsAppLink(WHATSAPP_NUMBER)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}
