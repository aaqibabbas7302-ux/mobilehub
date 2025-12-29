"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MoreHorizontal,
  MessageCircle,
  PhoneCall,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
  Loader2,
  RefreshCw,
  Globe,
  TrendingUp
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Inquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  inquiry_text: string;
  source: string;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  phone_id: string | null;
  customer_id: string | null;
  created_at: string;
  followed_up_at: string | null;
  metadata?: {
    intent?: string;
    detected_brand?: string;
    budget?: number;
    customer_message?: string;
    bot_reply?: string;
    timestamp?: string;
  };
}

interface Stats {
  total: number;
  new: number;
  replied: number;
  converted: number;
  closed: number;
  newToday: number;
  conversionRate: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-500", icon: Clock },
  replied: { label: "Replied", color: "bg-yellow-500/20 text-yellow-500", icon: MessageCircle },
  contacted: { label: "Contacted", color: "bg-purple-500/20 text-purple-500", icon: PhoneCall },
  converted: { label: "Converted", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-gray-500/20 text-gray-500", icon: XCircle },
  New: { label: "New", color: "bg-blue-500/20 text-blue-500", icon: Clock },
  Contacted: { label: "Contacted", color: "bg-purple-500/20 text-purple-500", icon: PhoneCall },
  Interested: { label: "Interested", color: "bg-yellow-500/20 text-yellow-500", icon: MessageCircle },
  Converted: { label: "Converted", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  Lost: { label: "Lost", color: "bg-gray-500/20 text-gray-500", icon: XCircle },
};

const sourceConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  WhatsApp: { label: "WhatsApp", color: "bg-green-500/20 text-green-500", icon: MessageSquare },
  Website: { label: "Website", color: "bg-blue-500/20 text-blue-500", icon: Globe },
  "Walk-in": { label: "Walk-in", color: "bg-purple-500/20 text-purple-500", icon: PhoneCall },
  OLX: { label: "OLX", color: "bg-orange-500/20 text-orange-500", icon: Globe },
  "Phone Call": { label: "Phone", color: "bg-cyan-500/20 text-cyan-500", icon: PhoneCall },
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [viewInquiry, setViewInquiry] = useState<Inquiry | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    replied: 0,
    converted: 0,
    closed: 0,
    newToday: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus, selectedSource]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedSource !== "all") params.append("source", selectedSource);
      
      const response = await fetch(`/api/inquiries?${params.toString()}`);
      const data = await response.json();
      
      if (data.inquiries) {
        setInquiries(data.inquiries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchInquiries();
        if (viewInquiry?.id === inquiryId) {
          setViewInquiry({ ...viewInquiry, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchInquiries();
        setViewInquiry(null);
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const name = inquiry.customer_name || "";
    const phone = inquiry.customer_phone || "";
    const message = inquiry.inquiry_text || "";
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const statsData = [
    { label: "Total Inquiries", value: stats.total.toString(), icon: MessageSquare, color: "from-blue-500 to-cyan-600" },
    { label: "New Today", value: (stats.newToday || 0).toString(), icon: Clock, color: "from-yellow-500 to-orange-600" },
    { label: "Pending Reply", value: (stats.new || 0).toString(), icon: MessageCircle, color: "from-purple-500 to-pink-600" },
    { label: "Conversion Rate", value: `${stats.conversionRate || 0}%`, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
  ];

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const phoneWithCode = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithCode}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inquiries</h1>
          <p className="text-gray-500 mt-1">Manage customer inquiries and leads</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchInquiries}
          className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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
              placeholder="Search by name, phone, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-gray-800 rounded-xl"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-36 bg-white/5 border-gray-800 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-full md:w-36 bg-white/5 border-gray-800 rounded-xl">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inquiry List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No inquiries found</h3>
            <p className="text-gray-500">Inquiries from customers will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredInquiries.map((inquiry) => {
              const status = statusConfig[inquiry.status] || statusConfig.new;
              const source = sourceConfig[inquiry.source] || sourceConfig.Website;
              const StatusIcon = status.icon;
              const SourceIcon = source.icon;
              
              return (
                <div 
                  key={inquiry.id} 
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setViewInquiry(inquiry)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {(inquiry.customer_name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{inquiry.customer_name || "Unknown"}</h3>
                        <span className="text-xs text-gray-500">{getTimeAgo(inquiry.created_at)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-400 truncate mb-2">{inquiry.inquiry_text || "No message"}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border-0 text-xs ${source.color}`}>
                          <SourceIcon className="w-3 h-3 mr-1" />
                          {source.label}
                        </Badge>
                        <Badge className={`border-0 text-xs ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(inquiry.customer_phone);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 text-green-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inquiry.id, "replied"); }}
                            className="cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 mr-2 text-yellow-500" />
                            Mark Replied
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inquiry.id, "converted"); }}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Mark Converted
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(inquiry.id, "closed"); }}
                            className="cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 mr-2 text-gray-500" />
                            Mark Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDelete(inquiry.id); }}
                            className="cursor-pointer text-red-500 focus:text-red-500"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Inquiry Dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={() => setViewInquiry(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              From {viewInquiry?.source || "unknown source"}
            </DialogDescription>
          </DialogHeader>
          
          {viewInquiry && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {(viewInquiry.customer_name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{viewInquiry.customer_name || "Unknown"}</h3>
                    <p className="text-sm text-gray-500">{viewInquiry.customer_phone}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 rounded-lg"
                    onClick={() => openWhatsApp(viewInquiry.customer_phone)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 rounded-lg border-gray-700"
                    onClick={() => window.open(`tel:${viewInquiry.customer_phone}`)}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
              
              {/* Message */}
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Message</p>
                <p className="text-gray-300">{viewInquiry.inquiry_text || "No message"}</p>
              </div>
              
              {/* WhatsApp Conversation (from n8n) */}
              {viewInquiry.metadata?.customer_message && (
                <div className="glass-card rounded-xl p-4 space-y-3">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    WhatsApp Conversation
                  </p>
                  
                  {/* Customer Message */}
                  <div className="flex justify-end">
                    <div className="bg-green-600/20 border border-green-500/30 rounded-xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-gray-300">{viewInquiry.metadata.customer_message}</p>
                      <p className="text-xs text-gray-500 text-right mt-1">Customer</p>
                    </div>
                  </div>
                  
                  {/* Bot Reply */}
                  {viewInquiry.metadata.bot_reply && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-300 whitespace-pre-line">{viewInquiry.metadata.bot_reply}</p>
                        <p className="text-xs text-gray-500 mt-1">🤖 Bot Reply</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Intent & Brand Info */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                    {viewInquiry.metadata.intent && (
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                        Intent: {viewInquiry.metadata.intent}
                      </Badge>
                    )}
                    {viewInquiry.metadata.detected_brand && (
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                        Brand: {viewInquiry.metadata.detected_brand}
                      </Badge>
                    )}
                    {viewInquiry.metadata.budget && (
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                        Budget: ₹{viewInquiry.metadata.budget?.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {viewInquiry.notes && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-300">{viewInquiry.notes}</p>
                </div>
              )}
              
              {/* Status Update */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 rounded-lg border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                  onClick={() => handleStatusUpdate(viewInquiry.id, "replied")}
                >
                  Replied
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 rounded-lg border-green-500/50 text-green-500 hover:bg-green-500/10"
                  onClick={() => handleStatusUpdate(viewInquiry.id, "converted")}
                >
                  Converted
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 rounded-lg border-gray-500/50 text-gray-500 hover:bg-gray-500/10"
                  onClick={() => handleStatusUpdate(viewInquiry.id, "closed")}
                >
                  Closed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
