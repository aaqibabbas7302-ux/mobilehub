"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  MessageSquare, 
  Search, 
  Send, 
  Phone, 
  User, 
  Clock, 
  CheckCheck, 
  Check,
  ArrowLeft,
  MoreVertical,
  Bot,
  UserCircle,
  ShoppingCart,
  Tag,
  Mail,
  Edit2,
  X,
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/lib/utils";

interface Conversation {
  customer_phone: string;
  customer_name: string | null;
  customer_id: string | null;
  last_message: string;
  last_message_direction: string;
  last_message_at: string;
  unread_count: number;
  message_count: number;
}

interface Message {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  direction: "inbound" | "outbound";
  message_type: string;
  message_text: string;
  is_bot_reply: boolean;
  ai_context: Record<string, unknown>;
  status: string;
  read_at: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  total_orders: number;
  total_spent: number;
  notes: string | null;
}

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, unread: 0, today: 0 });
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for phone param on mount
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setSelectedPhone(phoneParam);
    }
  }, [searchParams]);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
      setStats(data.stats || { total: 0, unread: 0, today: 0 });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (phone: string) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`/api/conversations?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setCustomer(data.customer || null);
      if (data.customer) {
        setCustomerForm(data.customer);
      }
      
      // Update unread count in conversation list
      setConversations(prev => prev.map(c => 
        c.customer_phone === phone ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchMessages(selectedPhone);
    }
  }, [selectedPhone]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update customer
  const updateCustomer = async () => {
    if (!selectedPhone) return;
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(selectedPhone)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm)
      });
      const data = await response.json();
      if (data.customer) {
        setCustomer(data.customer);
        setEditingCustomer(false);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.customer_phone.includes(query) ||
      c.customer_name?.toLowerCase().includes(query) ||
      c.last_message.toLowerCase().includes(query)
    );
  });

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    
    msgs.forEach(msg => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Conversations List */}
      <div className={`${selectedPhone ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 border-r border-gray-800`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-500" />
              WhatsApp
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchConversations}
              className="hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="glass-card rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Chats</p>
            </div>
            <div className="glass-card rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-orange-500">{stats.unread}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
            <div className="glass-card rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-green-500">{stats.today}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-gray-800"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">WhatsApp messages will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.customer_phone}
                onClick={() => setSelectedPhone(conv.customer_phone)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-gray-800/50 ${
                  selectedPhone === conv.customer_phone ? 'bg-white/10' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-bold">
                    {conv.customer_name?.[0]?.toUpperCase() || conv.customer_phone.slice(-2)}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center font-bold">
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">
                      {conv.customer_name || formatPhoneNumber(conv.customer_phone.replace("+91", ""))}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                    {conv.last_message_direction === "outbound" && (
                      <CheckCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                    {conv.last_message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedPhone ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between glass">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSelectedPhone(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold">
                {customer?.name?.[0]?.toUpperCase() || selectedPhone.slice(-2)}
              </div>
              
              <div>
                <h2 className="font-semibold">
                  {customer?.name || formatPhoneNumber(selectedPhone.replace("+91", ""))}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {selectedPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {customer && (
                <Badge className={`${
                  customer.status === 'vip' ? 'bg-purple-500' :
                  customer.status === 'active' ? 'bg-green-500' :
                  customer.status === 'new' ? 'bg-blue-500' :
                  'bg-gray-500'
                } text-white border-0`}>
                  {customer.status}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCustomerPanel(!showCustomerPanel)}
                className="hover:bg-white/10"
              >
                <UserCircle className="w-5 h-5" />
              </Button>
              
              <Link 
                href={`https://wa.me/${selectedPhone.replace("+", "")}`}
                target="_blank"
              >
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/chat-bg.png')] bg-repeat bg-opacity-5">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              groupMessagesByDate(messages).map((group) => (
                <div key={group.date}>
                  {/* Date Header */}
                  <div className="flex justify-center mb-4">
                    <span className="px-3 py-1 bg-gray-800/80 rounded-lg text-xs text-gray-400">
                      {formatDateHeader(group.date)}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.direction === "outbound"
                            ? "bg-green-600 rounded-br-sm"
                            : "bg-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.is_bot_reply && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                            <Bot className="w-3 h-3" />
                            <span>AI Reply</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {msg.direction === "outbound" && (
                            msg.status === "read" ? (
                              <CheckCheck className="w-3 h-3 text-blue-400" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Info Banner */}
          <div className="p-3 border-t border-gray-800 bg-yellow-500/10 text-center">
            <p className="text-xs text-yellow-400">
              💡 Replies are sent via n8n workflow. Open in WhatsApp to respond directly.
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">Select a conversation</p>
            <p className="text-sm">Choose from your existing conversations</p>
          </div>
        </div>
      )}

      {/* Customer Panel */}
      {showCustomerPanel && selectedPhone && (
        <div className="w-80 border-l border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold">Customer Details</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCustomerPanel(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {/* Customer Info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                {customer?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <h4 className="font-semibold text-lg">{customer?.name || "Unknown"}</h4>
              <p className="text-sm text-gray-500">{selectedPhone}</p>
            </div>

            {/* Edit Customer Form */}
            {editingCustomer ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <Input
                    value={customerForm.name || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <Input
                    value={customerForm.email || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="bg-white/5 border-gray-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <Select
                    value={customerForm.status || "active"}
                    onValueChange={(value) => setCustomerForm({ ...customerForm, status: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Notes</label>
                  <Textarea
                    value={customerForm.notes || ""}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    className="bg-white/5 border-gray-800"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={updateCustomer}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingCustomer(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-lg p-3 text-center">
                    <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{customer?.total_orders || 0}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <Tag className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">₹{((customer?.total_spent || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Spent</p>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-2">
                  <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedPhone}</span>
                  </div>
                  {customer?.email && (
                    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {customer?.notes && (
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <Button
                  variant="outline"
                  className="w-full border-gray-700"
                  onClick={() => setEditingCustomer(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>

                <Link href={`/admin/orders?customer=${selectedPhone}`}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Create Order
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
