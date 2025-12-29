"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Star,
  TrendingUp,
  ShoppingCart,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPrice, getWhatsAppLink } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  vip: number;
  active: number;
  new: number;
  avgOrderValue: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
  });
  const [editCustomer, setEditCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    vip: 0,
    active: 0,
    new: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, [selectedStatus]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();
      
      if (data.customers) {
        setCustomers(data.customers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== id));
        setShowDeleteDialog(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      status: customer.status || "active",
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    if (!editCustomer.name || !editCustomer.phone) {
      alert("Name and phone are required!");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCustomer),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedCustomer(null);
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Name and phone are required!");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewCustomer({ name: "", phone: "", email: "", status: "active" });
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer");
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const statsData = [
    { label: "Total Customers", value: stats.total.toString(), icon: Users, color: "from-blue-500 to-cyan-600" },
    { label: "VIP Customers", value: stats.vip.toString(), icon: Star, color: "from-yellow-500 to-orange-600" },
    { label: "New This Month", value: stats.new.toString(), icon: UserPlus, color: "from-green-500 to-emerald-600" },
    { label: "Avg. Order Value", value: formatPrice(stats.avgOrderValue), icon: TrendingUp, color: "from-purple-500 to-pink-600" },
  ];

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchCustomers}
            className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 border-0 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
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
              placeholder="Search customers by name, email, or phone..."
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
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No customers found</h3>
            <p className="text-gray-500">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-500 hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-medium text-gray-500">Orders</th>
                  <th className="text-left p-4 font-medium text-gray-500 hidden lg:table-cell">Total Spent</th>
                  <th className="text-left p-4 font-medium text-gray-500">Status</th>
                  <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-gray-500">{getTimeAgo(customer.updated_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {customer.email && (
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </p>
                        )}
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{customer.total_orders}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell font-semibold text-green-500">
                      {formatPrice(customer.total_spent)}
                    </td>
                    <td className="p-4">
                      <Badge className={`border-0 ${
                        customer.status === 'vip' 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : customer.status === 'new'
                          ? 'bg-blue-500/20 text-blue-500'
                          : customer.status === 'inactive'
                          ? 'bg-gray-500/20 text-gray-500'
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {customer.status === 'vip' && <Star className="w-3 h-3 mr-1" />}
                        {(customer.status || 'active').toUpperCase()}
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
                          <DropdownMenuItem 
                            onClick={() => openEditModal(customer)}
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openEditModal(customer)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <a href={getWhatsAppLink("91" + customer.phone.replace(/\D/g, "").slice(-10))} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                              WhatsApp
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(customer)}
                            className="cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your CRM
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Customer name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newCustomer.status} 
                onValueChange={(value) => setNewCustomer({ ...newCustomer, status: value })}
              >
                <SelectTrigger className="bg-white/5 border-gray-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-gray-700 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 border-0 rounded-xl cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Customer name"
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                placeholder="+91 98765 43210"
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="customer@example.com"
                value={editCustomer.email}
                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                className="bg-white/5 border-gray-800 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editCustomer.status} 
                onValueChange={(value) => setEditCustomer({ ...editCustomer, status: value })}
              >
                <SelectTrigger className="bg-white/5 border-gray-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1 border-gray-700 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCustomer}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 border-0 rounded-xl cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-white">{selectedCustomer?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 border-gray-700 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedCustomer && handleDelete(selectedCustomer.id)}
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 border-0 rounded-xl cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
