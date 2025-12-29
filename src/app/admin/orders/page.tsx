"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  Download,
  ShoppingCart,
  IndianRupee,
  Loader2,
  RefreshCw,
  Edit
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
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  phone_name: string;
  amount: number;
  final_amount: number;
  amount_formatted: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  revenue: number;
  revenueFormatted: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-500", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-blue-500/20 text-blue-500", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-500/20 text-purple-500", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-500", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-gray-500/20 text-gray-500", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    revenueFormatted: "₹0",
  });

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const statsData = [
    { label: "Total Orders", value: stats.total.toString(), icon: ShoppingCart, color: "from-blue-500 to-cyan-600" },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle, color: "from-green-500 to-emerald-600" },
    { label: "Processing", value: (stats.pending + stats.processing).toString(), icon: Clock, color: "from-yellow-500 to-orange-600" },
    { label: "Revenue", value: stats.revenueFormatted, icon: IndianRupee, color: "from-purple-500 to-pink-600" },
  ];

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchOrders}
            className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
              placeholder="Search by order ID, customer, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-gray-800 rounded-xl"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-40 bg-white/5 border-gray-800 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers make purchases</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 font-medium text-gray-500">Order</th>
                  <th className="text-left p-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-500 hidden md:table-cell">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500 hidden lg:table-cell">Payment</th>
                  <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || { label: order.status, color: "bg-gray-500/20 text-gray-500", icon: Clock };
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-mono font-semibold text-orange-500">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{getTimeAgo(order.created_at)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-gray-400">{order.phone_name}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-green-500">{order.amount_formatted}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={`border-0 ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant="outline" className="border-gray-700">
                          {order.payment_method || "Pending"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "processing")}
                              className="cursor-pointer"
                            >
                              <Package className="w-4 h-4 mr-2 text-blue-500" />
                              Mark Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "shipped")}
                              className="cursor-pointer"
                            >
                              <Truck className="w-4 h-4 mr-2 text-purple-500" />
                              Mark Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "completed")}
                              className="cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "cancelled")}
                              className="cursor-pointer text-red-500 focus:text-red-500"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
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
