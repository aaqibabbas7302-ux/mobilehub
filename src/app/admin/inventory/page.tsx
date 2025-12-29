"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Smartphone,
  Package,
  AlertCircle,
  TrendingUp,
  Loader2,
  RefreshCw
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, POPULAR_BRANDS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PhoneItem {
  id: string;
  brand: string;
  model_name: string;
  variant: string | null;
  color: string | null;
  condition_grade: string;
  battery_health_percent: number | null;
  selling_price: number;
  cost_price: number;
  original_mrp: number | null;
  images: string[] | null;
  status: string;
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

const statusConfig: Record<string, { label: string; color: string }> = {
  Available: { label: "In Stock", color: "bg-green-500/20 text-green-500" },
  Reserved: { label: "Reserved", color: "bg-yellow-500/20 text-yellow-500" },
  Sold: { label: "Sold", color: "bg-gray-500/20 text-gray-500" },
  "Under Repair": { label: "Repair", color: "bg-orange-500/20 text-orange-500" },
  "Quality Check": { label: "QC", color: "bg-blue-500/20 text-blue-500" },
};

export default function InventoryPage() {
  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const phonesList = data || [];
      setPhones(phonesList);
      
      // Calculate stats
      const available = phonesList.filter(p => p.status === "Available").length;
      const sold = phonesList.filter(p => p.status === "Sold").length;
      
      setStats({
        total: phonesList.length,
        inStock: available,
        lowStock: 0, // Would need quantity field
        outOfStock: sold,
      });
    } catch (err) {
      console.error("Error fetching phones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this phone?")) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("phones")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setPhones(phones.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting phone:", err);
      alert("Failed to delete phone");
    }
  };

  const filteredPhones = phones.filter((phone) => {
    const matchesSearch = phone.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         phone.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "all" || phone.brand === selectedBrand;
    const matchesStatus = selectedStatus === "all" || phone.status === selectedStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const statsData = [
    { label: "Total Products", value: stats.total.toString(), icon: Package, color: "from-blue-500 to-cyan-600" },
    { label: "In Stock", value: stats.inStock.toString(), icon: Smartphone, color: "from-green-500 to-emerald-600" },
    { label: "Reserved/QC", value: phones.filter(p => p.status === "Reserved" || p.status === "Quality Check").length.toString(), icon: AlertCircle, color: "from-yellow-500 to-orange-600" },
    { label: "Sold", value: stats.outOfStock.toString(), icon: TrendingUp, color: "from-purple-500 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your phone inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchPhones}
            className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/inventory/new">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 border-0 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Phone
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-gray-800 rounded-xl"
            />
          </div>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full md:w-40 bg-white/5 border-gray-800 rounded-xl">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Brands</SelectItem>
              {POPULAR_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-40 bg-white/5 border-gray-800 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Under Repair">Under Repair</SelectItem>
              <SelectItem value="Quality Check">Quality Check</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredPhones.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No phones in inventory</h3>
            <p className="text-gray-500 mb-4">Add your first phone to get started</p>
            <Link href="/admin/inventory/new">
              <Button className="btn-futuristic rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Phone
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Brand</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Condition</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Cost</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Profit</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPhones.map((phone) => {
                  const price = phone.selling_price;
                  const cost = phone.cost_price;
                  const profit = price - cost;
                  const status = statusConfig[phone.status] || { label: phone.status, color: "bg-gray-500/20 text-gray-500" };
                  const condition = conditionLabels[phone.condition_grade] || phone.condition_grade;

                  return (
                    <tr key={phone.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                            {phone.images?.[0] ? (
                              <img src={phone.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">📱</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{phone.model_name}</p>
                            <p className="text-xs text-gray-500">{phone.variant} {phone.color ? `• ${phone.color}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{phone.brand}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-gray-700">{condition}</Badge>
                      </td>
                      <td className="p-4 font-semibold text-green-500">{formatPrice(price)}</td>
                      <td className="p-4 text-gray-400">{formatPrice(cost)}</td>
                      <td className="p-4">
                        <span className={profit > 0 ? "text-green-500" : "text-red-500"}>
                          {profit > 0 ? "+" : ""}{formatPrice(profit)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={`border-0 ${status.color}`}>{status.label}</Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/phones/${phone.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/inventory/${phone.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(phone.id)}
                              className="cursor-pointer text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
