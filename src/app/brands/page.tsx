"use client";

import Link from "next/link";
import { 
  Phone, 
  MessageCircle, 
  ArrowRight, 
  Star, 
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWhatsAppLink } from "@/lib/utils";

const WHATSAPP_NUMBER = "919910724940";

const brands = [
  {
    name: "Apple",
    logo: "🍎",
    description: "Premium iPhones with iOS ecosystem",
    phoneCount: 45,
    priceRange: "₹15K - ₹1.2L",
    popular: ["iPhone 15 Pro", "iPhone 14", "iPhone 13"],
    featured: true,
    gradient: "from-gray-800 to-gray-900",
    rating: 4.9,
  },
  {
    name: "Samsung",
    logo: "📱",
    description: "Galaxy series with cutting-edge features",
    phoneCount: 62,
    priceRange: "₹8K - ₹95K",
    popular: ["Galaxy S24", "Galaxy S23", "Galaxy A54"],
    featured: true,
    gradient: "from-blue-600 to-blue-800",
    rating: 4.7,
  },
  {
    name: "OnePlus",
    logo: "🔴",
    description: "Flagship killer with OxygenOS",
    phoneCount: 38,
    priceRange: "₹12K - ₹70K",
    popular: ["OnePlus 12", "OnePlus Nord 3", "OnePlus 11"],
    featured: true,
    gradient: "from-red-600 to-red-800",
    rating: 4.8,
  },
  {
    name: "Google",
    logo: "🌐",
    description: "Pure Android with best camera AI",
    phoneCount: 18,
    priceRange: "₹25K - ₹85K",
    popular: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a"],
    featured: true,
    gradient: "from-emerald-600 to-emerald-800",
    rating: 4.8,
  },
  {
    name: "Xiaomi",
    logo: "🟠",
    description: "Value for money smartphones",
    phoneCount: 55,
    priceRange: "₹6K - ₹50K",
    popular: ["Xiaomi 14", "Redmi Note 13", "POCO F5"],
    featured: false,
    gradient: "from-orange-600 to-orange-800",
    rating: 4.5,
  },
  {
    name: "Vivo",
    logo: "🔵",
    description: "Camera-focused smartphones",
    phoneCount: 42,
    priceRange: "₹7K - ₹55K",
    popular: ["Vivo X90", "Vivo V29", "Vivo Y100"],
    featured: false,
    gradient: "from-cyan-600 to-cyan-800",
    rating: 4.4,
  },
  {
    name: "OPPO",
    logo: "🟢",
    description: "Innovative design & fast charging",
    phoneCount: 36,
    priceRange: "₹8K - ₹60K",
    popular: ["OPPO Reno 11", "OPPO F25", "OPPO A79"],
    featured: false,
    gradient: "from-green-600 to-green-800",
    rating: 4.4,
  },
  {
    name: "Realme",
    logo: "🟡",
    description: "Youth-focused performance phones",
    phoneCount: 48,
    priceRange: "₹5K - ₹35K",
    popular: ["Realme 12 Pro", "Realme GT 5", "Realme Narzo 60"],
    featured: false,
    gradient: "from-yellow-600 to-yellow-800",
    rating: 4.3,
  },
  {
    name: "Nothing",
    logo: "⚪",
    description: "Unique Glyph interface design",
    phoneCount: 12,
    priceRange: "₹18K - ₹45K",
    popular: ["Nothing Phone 2", "Nothing Phone 2a"],
    featured: false,
    gradient: "from-gray-600 to-gray-800",
    rating: 4.6,
  },
  {
    name: "Motorola",
    logo: "Ⓜ️",
    description: "Stock Android experience",
    phoneCount: 28,
    priceRange: "₹7K - ₹55K",
    popular: ["Edge 40", "G84", "Razr 40"],
    featured: false,
    gradient: "from-indigo-600 to-indigo-800",
    rating: 4.3,
  },
  {
    name: "iQOO",
    logo: "⚡",
    description: "Gaming-focused performance",
    phoneCount: 22,
    priceRange: "₹15K - ₹55K",
    popular: ["iQOO 12", "iQOO Neo 9", "iQOO Z7"],
    featured: false,
    gradient: "from-violet-600 to-violet-800",
    rating: 4.5,
  },
  {
    name: "ASUS",
    logo: "🎮",
    description: "ROG gaming smartphones",
    phoneCount: 8,
    priceRange: "₹30K - ₹90K",
    popular: ["ROG Phone 8", "ROG Phone 7", "Zenfone 10"],
    featured: false,
    gradient: "from-pink-600 to-pink-800",
    rating: 4.7,
  },
];

export default function BrandsPage() {
  const featuredBrands = brands.filter(b => b.featured);
  const otherBrands = brands.filter(b => !b.featured);

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="orb orb-orange w-[500px] h-[500px] -top-48 -left-48" />
        <div className="orb orb-purple w-[400px] h-[400px] bottom-20 -right-48" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Mobile<span className="text-orange-500">Hub</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/phones" className="text-gray-400 hover:text-white transition-colors">All Phones</Link>
            <Link href="/brands" className="text-orange-500 font-medium">Brands</Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </nav>

          <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
            <Button className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            All Major Brands
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Shop by <span className="text-orange-500">Brand</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our collection of certified pre-owned phones from world&apos;s leading brands.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: Shield, label: "6-Month Warranty" },
              { icon: TrendingUp, label: "Best Prices in Delhi" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <item.icon className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Featured Brands</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBrands.map((brand) => (
              <Link href={`/phones?brand=${brand.name}`} key={brand.name}>
                <div className="glass-card rounded-3xl overflow-hidden group card-hover-effect h-full">
                  <div className={`relative h-32 bg-gradient-to-br ${brand.gradient} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {brand.logo}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{brand.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold">{brand.name}</h3>
                      <p className="text-sm text-gray-400">{brand.description}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Available:</span>
                      <span className="text-orange-500 font-semibold">{brand.phoneCount} phones</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">{brand.priceRange}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-xs text-gray-600 mb-2">Popular:</p>
                      <div className="flex flex-wrap gap-1">
                        {brand.popular.map((model) => (
                          <Badge key={model} className="bg-white/5 text-gray-400 border-0 text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Brands */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">All Brands</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherBrands.map((brand) => (
              <Link href={`/phones?brand=${brand.name}`} key={brand.name}>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4 group card-hover-effect">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {brand.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{brand.name}</h3>
                    <p className="text-sm text-gray-500">{brand.phoneCount} phones</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="gradient-border rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Can&apos;t find your brand?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              We have many more phones in stock! Contact us on WhatsApp and we&apos;ll help you find the perfect phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
                <Button className="btn-futuristic bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 rounded-2xl border-0 text-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
              <Link href="/phones">
                <Button variant="outline" className="border-gray-700 bg-transparent hover:bg-white/5 px-8 py-6 rounded-2xl text-lg">
                  View All Phones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">© 2024 MobileHub Delhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
