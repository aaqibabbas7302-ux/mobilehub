"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice, calculateDiscount, getWhatsAppLink, POPULAR_BRANDS } from "@/lib/utils";

// Mock data - replace with Supabase
const allPhones = [
  { id: "1", brand: "Apple", model_name: "iPhone 13", variant: "128GB", color: "Midnight", condition_grade: "A+", battery_health_percent: 92, selling_price_paise: 5299900, original_mrp_paise: 7990000, warranty_type: "60 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=iPhone+13"] },
  { id: "2", brand: "Samsung", model_name: "Galaxy S23", variant: "8GB/256GB", color: "Phantom Black", condition_grade: "A", battery_health_percent: 88, selling_price_paise: 4899900, original_mrp_paise: 7499900, warranty_type: "30 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=Galaxy+S23"] },
  { id: "3", brand: "OnePlus", model_name: "11R 5G", variant: "8GB/128GB", color: "Sonic Black", condition_grade: "A+", battery_health_percent: 95, selling_price_paise: 3199900, original_mrp_paise: 3999900, warranty_type: "60 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=OnePlus+11R"] },
  { id: "4", brand: "Apple", model_name: "iPhone 12", variant: "64GB", color: "Blue", condition_grade: "B+", battery_health_percent: 84, selling_price_paise: 3499900, original_mrp_paise: 6590000, warranty_type: "30 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=iPhone+12"] },
  { id: "5", brand: "Xiaomi", model_name: "Redmi Note 12 Pro", variant: "8GB/128GB", color: "Glacier Blue", condition_grade: "A", battery_health_percent: 96, selling_price_paise: 1899900, original_mrp_paise: 2799900, warranty_type: "30 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=Redmi+Note+12"] },
  { id: "6", brand: "Samsung", model_name: "Galaxy A54 5G", variant: "8GB/256GB", color: "Awesome Graphite", condition_grade: "A+", battery_health_percent: 98, selling_price_paise: 2799900, original_mrp_paise: 3899900, warranty_type: "60 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=Galaxy+A54"] },
  { id: "7", brand: "Apple", model_name: "iPhone 14 Pro", variant: "256GB", color: "Deep Purple", condition_grade: "A", battery_health_percent: 90, selling_price_paise: 8999900, original_mrp_paise: 12990000, warranty_type: "90 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=iPhone+14+Pro"] },
  { id: "8", brand: "OnePlus", model_name: "Nord CE 3", variant: "8GB/128GB", color: "Aqua Surge", condition_grade: "B+", battery_health_percent: 91, selling_price_paise: 2299900, original_mrp_paise: 2699900, warranty_type: "30 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=OnePlus+Nord"] },
  { id: "9", brand: "Vivo", model_name: "V29 Pro", variant: "8GB/256GB", color: "Starry Purple", condition_grade: "A+", battery_health_percent: 99, selling_price_paise: 3699900, original_mrp_paise: 4699900, warranty_type: "60 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=Vivo+V29+Pro"] },
  { id: "10", brand: "Realme", model_name: "GT Neo 5", variant: "8GB/128GB", color: "Black", condition_grade: "A", battery_health_percent: 94, selling_price_paise: 2599900, original_mrp_paise: 3499900, warranty_type: "30 Days", status: "Available", images: ["https://placehold.co/400x400/1a1a1a/white?text=Realme+GT"] },
];

const WHATSAPP_NUMBER = "919876543210";

const priceRanges = [
  { label: "Under ₹15,000", min: 0, max: 1500000 },
  { label: "₹15,000 - ₹25,000", min: 1500000, max: 2500000 },
  { label: "₹25,000 - ₹40,000", min: 2500000, max: 4000000 },
  { label: "₹40,000 - ₹60,000", min: 4000000, max: 6000000 },
  { label: "Above ₹60,000", min: 6000000, max: Infinity },
];

const conditionGrades = ["A+", "A", "B+", "B"];

export default function PhonesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  const filteredPhones = allPhones.filter((phone) => {
    const matchesSearch = 
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.model_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(phone.brand);
    
    const matchesPrice = selectedPriceRange === null || 
      (phone.selling_price_paise >= priceRanges[selectedPriceRange].min && 
       phone.selling_price_paise < priceRanges[selectedPriceRange].max);
    
    const matchesCondition = selectedConditions.length === 0 || 
      selectedConditions.includes(phone.condition_grade);

    return matchesSearch && matchesBrand && matchesPrice && matchesCondition;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.selling_price_paise - b.selling_price_paise;
    if (sortBy === "price-high") return b.selling_price_paise - a.selling_price_paise;
    return 0;
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setSelectedConditions([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedPriceRange !== null || selectedConditions.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Brand</h4>
        <div className="space-y-2">
          {POPULAR_BRANDS.slice(0, 8).map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <div key={range.label} className="flex items-center gap-2">
              <Checkbox
                id={`price-${index}`}
                checked={selectedPriceRange === index}
                onCheckedChange={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
              />
              <Label htmlFor={`price-${index}`} className="text-sm cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Condition</h4>
        <div className="space-y-2">
          {conditionGrades.map((grade) => (
            <div key={grade} className="flex items-center gap-2">
              <Checkbox
                id={`condition-${grade}`}
                checked={selectedConditions.includes(grade)}
                onCheckedChange={() => toggleCondition(grade)}
              />
              <Label htmlFor={`condition-${grade}`} className="text-sm cursor-pointer">
                Grade {grade}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

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
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/phones" className="text-blue-600 font-medium">
                All Phones
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Home
              </Link>
            </nav>

            <a href={getWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Phones</h1>
          <p className="text-gray-600 mt-1">
            {filteredPhones.length} phones available
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search phones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-blue-600">{selectedBrands.length + (selectedPriceRange !== null ? 1 : 0) + selectedConditions.length}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedBrands.map((brand) => (
              <Badge key={brand} variant="secondary" className="gap-1">
                {brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(brand)} />
              </Badge>
            ))}
            {selectedPriceRange !== null && (
              <Badge variant="secondary" className="gap-1">
                {priceRanges[selectedPriceRange].label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPriceRange(null)} />
              </Badge>
            )}
            {selectedConditions.map((condition) => (
              <Badge key={condition} variant="secondary" className="gap-1">
                Grade {condition}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCondition(condition)} />
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Phone Grid */}
          <div className="flex-1">
            {filteredPhones.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPhones.map((phone) => {
                  const discount = calculateDiscount(phone.original_mrp_paise, phone.selling_price_paise);
                  
                  return (
                    <Card key={phone.id} className="group overflow-hidden hover:shadow-lg transition-shadow bg-white">
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
                        <h3 className="font-semibold text-gray-900">
                          {phone.brand} {phone.model_name}
                        </h3>
                        <p className="text-sm text-gray-500">{phone.variant} • {phone.color}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>🔋 {phone.battery_health_percent}%</span>
                          <span>•</span>
                          <span>📦 {phone.warranty_type}</span>
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
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border">
                <Phone className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No phones found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

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
