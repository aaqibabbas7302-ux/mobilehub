"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Phone, 
  MessageCircle, 
  Search, 
  Filter, 
  Grid3X3,
  Battery,
  ArrowRight,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, getWhatsAppLink, POPULAR_BRANDS, getConditionColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const WHATSAPP_NUMBER = "919910724940";

interface PhoneItem {
  id: string;
  brand: string;
  model_name: string;
  variant: string | null;
  color: string | null;
  condition_grade: string;
  battery_health_percent: number | null;
  selling_price: number;
  original_mrp: number | null;
  images: string[] | null;
  status: string;
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
  "from-yellow-500 to-amber-500",
];

export default function PhonesPage() {
  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("phones")
        .select("*")
        .eq("status", "Available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (err) {
      console.error("Error fetching phones:", err);
      setError("Failed to load phones");
    } finally {
      setLoading(false);
    }
  };

  const filteredPhones = phones.filter((phone) => {
    const matchesSearch = 
      phone.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "all" || phone.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const sortedPhones = [...filteredPhones].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.selling_price - b.selling_price;
      case "price_high":
        return b.selling_price - a.selling_price;
      default:
        return 0;
    }
  });

  const getGradient = (index: number) => gradients[index % gradients.length];

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Mobile<span className="text-orange-500">Hub</span>
              </span>
            </Link>
            <a href={getWhatsAppLink(WHATSAPP_NUMBER, "Hi, I'm looking for phones")}>
              <Button className="btn-futuristic rounded-xl">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full md:w-48 bg-white/5 border-gray-800 rounded-xl">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="all">All Brands</SelectItem>
                {POPULAR_BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-white/5 border-gray-800 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {loading ? "Loading..." : `${sortedPhones.length} Phones Available`}
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchPhones} className="mt-4">Retry</Button>
          </div>
        ) : sortedPhones.length === 0 ? (
          <div className="text-center py-20">
            <Grid3X3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No phones found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPhones.map((phone, index) => {
              const price = phone.selling_price;
              const originalPrice = phone.original_mrp || null;
              const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
              const condition = conditionLabels[phone.condition_grade] || phone.condition_grade;

              return (
                <Link key={phone.id} href={`/phones/${phone.id}`}>
                  <div className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    {/* Image */}
                    <div className={`relative aspect-square bg-gradient-to-br ${getGradient(index)}`}>
                      {phone.images?.[0] ? (
                        <img 
                          src={phone.images[0]} 
                          alt={phone.model_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-8xl">📱</span>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className={`${getConditionColor(condition)} border-0`}>
                          {condition}
                        </Badge>
                        {discount > 0 && (
                          <Badge className="bg-green-500/90 text-white border-0">
                            -{discount}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Battery */}
                      {phone.battery_health_percent && (
                        <div className="absolute bottom-3 right-3 glass rounded-full px-3 py-1 flex items-center gap-1">
                          <Battery className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-medium">{phone.battery_health_percent}%</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-xs text-orange-500 font-medium mb-1">{phone.brand}</p>
                      <h3 className="font-bold text-lg mb-1 truncate">{phone.model_name}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {phone.variant || ""} {phone.color ? `• ${phone.color}` : ""}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-orange-500">{formatPrice(price)}</span>
                          {originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                          <ArrowRight className="w-4 h-4 text-orange-500 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* WhatsApp Float */}
      <a
        href={getWhatsAppLink(WHATSAPP_NUMBER, "Hi, I want to know about available phones")}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </a>
    </div>
  );
}
