"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Plus,
  FileText,
  Mail,
  Phone,
  User,
  Smartphone,
  Store,
  Globe,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { CustomFieldsForm } from "@/components/custom-fields-form";

interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  phone_id: string | null;
  phone_name: string;
  phone_brand: string;
  phone_variant: string | null;
  phone_imei: string | null;
  amount: number;
  discount: number;
  final_amount: number;
  amount_formatted?: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  sale_channel: string;
  invoice_url: string | null;
  invoice_sent_at: string | null;
  notes: string | null;
  created_at: string;
  custom_data?: Record<string, unknown>;
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

interface PhoneItem {
  id: string;
  brand: string;
  model_name: string;
  variant: string | null;
  selling_price: number;
  imei_1: string;
  status: string;
}

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
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

const saleChannels = [
  { value: "Store", label: "In Store", icon: Store },
  { value: "WhatsApp", label: "WhatsApp", icon: MessageSquare },
  { value: "Website", label: "Website", icon: Globe },
  { value: "OLX", label: "OLX/Classifieds", icon: Globe },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "emi", label: "EMI" },
];

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const customerPhone = searchParams.get("customer");
  
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

  // Create Order Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    phone_id: "",
    phone_name: "",
    phone_brand: "",
    phone_variant: "",
    phone_imei: "",
    amount: "",
    discount: "0",
    payment_method: "cash",
    sale_channel: "Store",
    notes: "",
  });
  const [orderCustomData, setOrderCustomData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchOrders();
    fetchPhones();
    fetchCustomers();
  }, [selectedStatus]);

  useEffect(() => {
    // Open create modal with customer prefilled from URL
    if (customerPhone) {
      setShowCreateModal(true);
      setOrderForm(prev => ({
        ...prev,
        customer_phone: customerPhone.replace("+91", "")
      }));
    }
  }, [customerPhone]);

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

  const fetchPhones = async () => {
    try {
      const response = await fetch("/api/phones?status=Available&limit=100");
      const data = await response.json();
      setPhones(data.phones || []);
    } catch (error) {
      console.error("Error fetching phones:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers?limit=100");
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
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
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const selectPhone = (phone: PhoneItem) => {
    setOrderForm({
      ...orderForm,
      phone_id: phone.id,
      phone_name: `${phone.brand} ${phone.model_name}`,
      phone_brand: phone.brand,
      phone_variant: phone.variant || "",
      phone_imei: phone.imei_1,
      amount: phone.selling_price.toString(),
    });
    setPhoneSearch(`${phone.brand} ${phone.model_name}`);
    setShowPhoneDropdown(false);
  };

  const selectCustomer = (customer: CustomerItem) => {
    setOrderForm({
      ...orderForm,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || "",
    });
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const createOrder = async () => {
    if (!orderForm.phone_name || !orderForm.customer_name || !orderForm.amount) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const amount = parseFloat(orderForm.amount);
      const discount = parseFloat(orderForm.discount) || 0;
      const finalAmount = amount - discount;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: orderForm.customer_id || null,
          customer_name: orderForm.customer_name,
          customer_phone: orderForm.customer_phone,
          customer_email: orderForm.customer_email || null,
          phone_id: orderForm.phone_id || null,
          phone_name: orderForm.phone_name,
          phone_brand: orderForm.phone_brand,
          phone_variant: orderForm.phone_variant || null,
          phone_imei: orderForm.phone_imei,
          amount,
          discount,
          final_amount: finalAmount,
          payment_method: orderForm.payment_method,
          sale_channel: orderForm.sale_channel,
          notes: orderForm.notes || null,
          status: "confirmed",
          payment_status: "paid",
          custom_data: orderCustomData,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetOrderForm();
        fetchOrders();
        fetchPhones();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  const resetOrderForm = () => {
    setOrderForm({
      customer_id: "",
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      phone_id: "",
      phone_name: "",
      phone_brand: "",
      phone_variant: "",
      phone_imei: "",
      amount: "",
      discount: "0",
      payment_method: "cash",
      sale_channel: "Store",
      notes: "",
    });
    setOrderCustomData({});
    setPhoneSearch("");
    setCustomerSearch("");
  };

  const generateInvoice = async (order: Order) => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${order.order_number}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const sendInvoiceEmail = async (order: Order) => {
    if (!order.customer_email) {
      alert("Customer email is required to send invoice");
      return;
    }

    setSendingInvoice(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/send-invoice`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Invoice sent successfully!");
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert("Failed to send invoice");
    } finally {
      setSendingInvoice(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredPhones = phones.filter(p => 
    p.status === "Available" && (
      p.brand.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      p.model_name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      p.imei_1.includes(phoneSearch)
    )
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

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

  const finalAmount = parseFloat(orderForm.amount || "0") - parseFloat(orderForm.discount || "0");

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
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
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
            <p className="text-gray-500 mb-4">Create your first order to get started</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
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
                  <th className="text-left p-4 font-medium text-gray-500 hidden lg:table-cell">Channel</th>
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
                        {order.phone_variant && (
                          <p className="text-xs text-gray-500">{order.phone_variant}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-green-500">{formatPrice(order.final_amount)}</p>
                        {order.discount > 0 && (
                          <p className="text-xs text-gray-500">-{formatPrice(order.discount)} off</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={`border-0 ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant="outline" className="border-gray-700">
                          {order.sale_channel || "Store"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 w-48">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => generateInvoice(order)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Download Invoice
                            </DropdownMenuItem>
                            {order.customer_email && (
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => sendInvoiceEmail(order)}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, "processing")}
                              className="cursor-pointer"
                            >
                              <Package className="w-4 h-4 mr-2 text-blue-500" />
                              Mark Processing
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

      {/* Create Order Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Create New Order
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Customer Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Customer Details
              </h3>
              
              <div className="relative">
                <Label>Search Customer</Label>
                <Input
                  placeholder="Search by name or phone..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="bg-white/5 border-gray-800"
                />
                {showCustomerDropdown && customerSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No customers found</div>
                    ) : (
                      filteredCustomers.slice(0, 5).map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="w-full p-3 text-left hover:bg-white/10 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                    placeholder="Enter name"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={orderForm.customer_phone}
                    onChange={(e) => setOrderForm({ ...orderForm, customer_phone: e.target.value })}
                    placeholder="10-digit number"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
              </div>
              <div>
                <Label>Email (for invoice)</Label>
                <Input
                  type="email"
                  value={orderForm.customer_email}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_email: e.target.value })}
                  placeholder="customer@email.com"
                  className="bg-white/5 border-gray-800"
                />
              </div>
            </div>

            {/* Phone Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-500" />
                Phone Details
              </h3>
              
              <div className="relative">
                <Label>Search Inventory</Label>
                <Input
                  placeholder="Search by brand, model, or IMEI..."
                  value={phoneSearch}
                  onChange={(e) => {
                    setPhoneSearch(e.target.value);
                    setShowPhoneDropdown(true);
                  }}
                  onFocus={() => setShowPhoneDropdown(true)}
                  className="bg-white/5 border-gray-800"
                />
                {showPhoneDropdown && phoneSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg max-h-48 overflow-y-auto">
                    {filteredPhones.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No available phones found</div>
                    ) : (
                      filteredPhones.slice(0, 5).map((phone) => (
                        <button
                          key={phone.id}
                          onClick={() => selectPhone(phone)}
                          className="w-full p-3 text-left hover:bg-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">{phone.brand} {phone.model_name}</p>
                              <p className="text-xs text-gray-500">{phone.variant} • IMEI: {phone.imei_1.slice(-6)}</p>
                            </div>
                          </div>
                          <span className="text-green-500 font-semibold">{formatPrice(phone.selling_price)}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Name *</Label>
                  <Input
                    value={orderForm.phone_name}
                    onChange={(e) => setOrderForm({ ...orderForm, phone_name: e.target.value })}
                    placeholder="e.g. iPhone 13 Pro"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <Label>IMEI</Label>
                  <Input
                    value={orderForm.phone_imei}
                    onChange={(e) => setOrderForm({ ...orderForm, phone_imei: e.target.value })}
                    placeholder="15-digit IMEI"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-500" />
                Pricing
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={orderForm.amount}
                    onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                    placeholder="0"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <Label>Discount (₹)</Label>
                  <Input
                    type="number"
                    value={orderForm.discount}
                    onChange={(e) => setOrderForm({ ...orderForm, discount: e.target.value })}
                    placeholder="0"
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <Label>Final Amount</Label>
                  <div className="h-10 px-3 flex items-center bg-green-500/10 border border-green-500/30 rounded-md">
                    <span className="text-green-500 font-bold">{formatPrice(finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Channel */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={orderForm.payment_method}
                  onValueChange={(value) => setOrderForm({ ...orderForm, payment_method: value })}
                >
                  <SelectTrigger className="bg-white/5 border-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sale Channel</Label>
                <Select
                  value={orderForm.sale_channel}
                  onValueChange={(value) => setOrderForm({ ...orderForm, sale_channel: value })}
                >
                  <SelectTrigger className="bg-white/5 border-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {saleChannels.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        <div className="flex items-center gap-2">
                          <channel.icon className="w-4 h-4" />
                          {channel.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="bg-white/5 border-gray-800"
                rows={2}
              />
            </div>

            {/* Custom Fields */}
            <CustomFieldsForm
              entityType="orders"
              values={orderCustomData}
              onChange={setOrderCustomData}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetOrderForm();
                }}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={createOrder}
                disabled={creating}
                className="bg-gradient-to-r from-orange-500 to-red-600"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 mt-4">
              {/* Order Info */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-lg text-orange-500">{selectedOrder.order_number}</span>
                  <Badge className={`border-0 ${statusConfig[selectedOrder.status]?.color || "bg-gray-500/20"}`}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Customer */}
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Customer</h4>
                <p className="font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-400">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && (
                  <p className="text-sm text-gray-400">{selectedOrder.customer_email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Phone</h4>
                <p className="font-semibold">{selectedOrder.phone_name}</p>
                {selectedOrder.phone_variant && (
                  <p className="text-sm text-gray-400">{selectedOrder.phone_variant}</p>
                )}
                {selectedOrder.phone_imei && (
                  <p className="text-xs text-gray-500 font-mono mt-1">IMEI: {selectedOrder.phone_imei}</p>
                )}
              </div>

              {/* Payment */}
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment</h4>
                <div className="flex justify-between items-center">
                  <span>Amount</span>
                  <span>{formatPrice(selectedOrder.amount)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between items-center text-red-400">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span className="text-green-500">{formatPrice(selectedOrder.final_amount)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="border-gray-700">
                    {selectedOrder.payment_method || "Pending"}
                  </Badge>
                  <Badge variant="outline" className="border-gray-700">
                    {selectedOrder.sale_channel || "Store"}
                  </Badge>
                </div>
              </div>

              {/* Custom Fields */}
              {selectedOrder.custom_data && Object.keys(selectedOrder.custom_data).length > 0 && (
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Details</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedOrder.custom_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => generateInvoice(selectedOrder)}
                  disabled={generatingInvoice}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {generatingInvoice ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </>
                  )}
                </Button>
                {selectedOrder.customer_email && (
                  <Button
                    onClick={() => sendInvoiceEmail(selectedOrder)}
                    disabled={sendingInvoice}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {sendingInvoice ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Invoice sent info */}
              {selectedOrder.invoice_sent_at && (
                <p className="text-xs text-center text-gray-500">
                  Invoice emailed on {new Date(selectedOrder.invoice_sent_at).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
