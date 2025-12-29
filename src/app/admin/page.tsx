"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Smartphone, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  Plus,
  MessageSquare,
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface PhoneItem {
  id: string;
  brand: string;
  model_name: string;
  selling_price: number;
  selling_price_formatted: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  stats: {
    revenue: {
      total: number;
      formatted: string;
      thisMonth: number;
      thisMonthFormatted: string;
      growth: number;
    };
    profit: {
      total: number;
      formatted: string;
    };
    inventory: {
      total: number;
      available: number;
      sold: number;
      reserved: number;
      value: number;
      valueFormatted: string;
    };
    orders: {
      total: number;
      pending: number;
      completed: number;
      thisMonth: number;
    };
    customers: {
      total: number;
      vip: number;
      newThisMonth: number;
    };
    inquiries: {
      total: number;
      new: number;
      today: number;
      whatsapp: number;
      conversionRate: number;
    };
  };
  recent: {
    phones: PhoneItem[];
    orders: Array<{
      id: string;
      order_number: string;
      customer_name: string;
      phone_name: string;
      final_amount: number;
      final_amount_formatted: string;
      status: string;
      created_at: string;
    }>;
    inquiries: Array<{
      id: string;
      name: string;
      phone: string;
      message: string;
      source: string;
      status: string;
      created_at: string;
    }>;
  };
}

const defaultData: DashboardData = {
  stats: {
    revenue: { total: 0, formatted: "₹0", thisMonth: 0, thisMonthFormatted: "₹0", growth: 0 },
    profit: { total: 0, formatted: "₹0" },
    inventory: { total: 0, available: 0, sold: 0, reserved: 0, value: 0, valueFormatted: "₹0" },
    orders: { total: 0, pending: 0, completed: 0, thisMonth: 0 },
    customers: { total: 0, vip: 0, newThisMonth: 0 },
    inquiries: { total: 0, new: 0, today: 0, whatsapp: 0, conversionRate: 0 },
  },
  recent: { phones: [], orders: [], inquiries: [] },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(defaultData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      
      if (result.success && result.dashboard) {
        setData(result.dashboard);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      name: "Total Revenue",
      value: data.stats.revenue.formatted,
      subtitle: `${data.stats.inventory.sold} phones sold`,
      icon: IndianRupee,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Phones in Stock",
      value: data.stats.inventory.available.toString(),
      subtitle: `Worth ${data.stats.inventory.valueFormatted}`,
      icon: Smartphone,
      color: "from-blue-500 to-cyan-600",
    },
    {
      name: "Total Orders",
      value: data.stats.orders.total.toString(),
      subtitle: `${data.stats.orders.pending} pending`,
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-600",
    },
    {
      name: "Customers",
      value: data.stats.customers.total.toString(),
      subtitle: `${data.stats.customers.vip} VIP`,
      icon: Users,
      color: "from-orange-500 to-red-600",
    },
  ];

  const secondaryStats = [
    { label: "Orders This Month", value: data.stats.orders.thisMonth, icon: Calendar, color: "text-blue-500" },
    { label: "New Inquiries", value: data.stats.inquiries.new, icon: MessageSquare, color: "text-yellow-500" },
    { label: "Completed Orders", value: data.stats.orders.completed, icon: CheckCircle, color: "text-green-500" },
    { label: "Total Profit", value: data.stats.profit.formatted, icon: TrendingUp, color: "text-purple-500" },
  ];

  const recentPhones = data.recent.phones || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your inventory overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchData}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <div key={stat.name} className="glass-card rounded-2xl p-6 card-hover-effect">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {secondaryStats.map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Phones */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold">Recent Inventory</h2>
                </div>
                <Link href="/admin/inventory">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentPhones.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-500">No phones in inventory yet</p>
                  <Link href="/admin/inventory/new">
                    <Button className="mt-4 btn-futuristic rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Phone
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-800">
                        <th className="pb-4 font-medium">Phone</th>
                        <th className="pb-4 font-medium">Brand</th>
                        <th className="pb-4 font-medium">Price</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {recentPhones.map((phone) => (
                        <tr key={phone.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-lg">
                                📱
                              </div>
                              <span className="font-medium">{phone.model_name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-400">{phone.brand}</td>
                          <td className="py-4 font-semibold text-green-500">{phone.selling_price_formatted}</td>
                          <td className="py-4">
                            <Badge className={`border-0 ${
                              phone.status === "Available" ? "bg-green-500/20 text-green-500" :
                              phone.status === "Sold" ? "bg-gray-500/20 text-gray-500" :
                              "bg-yellow-500/20 text-yellow-500"
                            }`}>
                              {phone.status}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Link href={`/phones/${phone.id}`}>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/admin/inventory/new" className="block">
                    <Button variant="outline" className="w-full justify-start border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl py-6">
                      <Plus className="w-5 h-5 mr-3 text-green-500" />
                      Add New Phone
                    </Button>
                  </Link>
                  <Link href="/admin/inventory" className="block">
                    <Button variant="outline" className="w-full justify-start border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl py-6">
                      <Package className="w-5 h-5 mr-3 text-blue-500" />
                      View Inventory
                    </Button>
                  </Link>
                  <Link href="/phones" className="block">
                    <Button variant="outline" className="w-full justify-start border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl py-6">
                      <Eye className="w-5 h-5 mr-3 text-purple-500" />
                      View Public Website
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold">WhatsApp Connected</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Your AI agent is ready to handle customer inquiries on WhatsApp.
                </p>
                <Link href="/admin/settings">
                  <Button variant="outline" size="sm" className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 rounded-lg">
                    Configure Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
