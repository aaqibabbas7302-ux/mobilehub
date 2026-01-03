"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Loader2,
  Users,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  status: string;
  total_orders: number;
}

interface Phone {
  id: string;
  brand: string;
  model_name: string;
  selling_price: number;
  condition: string;
  storage: string;
  color: string;
}

export default function MarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [sending, setSending] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected

  useEffect(() => {
    fetchCustomers();
    fetchInventory();
    checkWhatsAppStatus();
    
    // Poll status every 5 seconds
    const interval = setInterval(checkWhatsAppStatus, 5000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/status");
      if (response.ok) {
        const data = await response.json();
        if (data.isReady) {
          setIsWhatsAppConnected(true);
          setConnectionStatus("connected");
          setShowQrModal(false);
        } else {
          setIsWhatsAppConnected(false);
          setConnectionStatus(data.hasQr ? "connecting" : "disconnected");
        }
      }
    } catch (error) {
      console.log("WhatsApp backend not running");
      setIsWhatsAppConnected(false);
      setConnectionStatus("disconnected");
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();
      
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/phones?status=Available&limit=100");
      const data = await response.json();
      if (data.phones) {
        setInventory(data.phones);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleConnect = async () => {
    setShowQrModal(true);
    setIsScanning(true);
    
    // Poll for QR code
    const fetchQr = async () => {
      try {
        const response = await fetch("http://localhost:3001/qr");
        if (response.ok) {
          const data = await response.json();
          if (data.qr) {
            setQrCode(data.qr);
            setIsScanning(false);
          }
        }
      } catch (error) {
        console.error("Error fetching QR:", error);
      }
    };

    fetchQr();
    const interval = setInterval(fetchQr, 2000);
    
    // Cleanup interval when modal closes or connected
    return () => clearInterval(interval);
  };

  const handleDisconnect = async () => {
    try {
      await fetch("http://localhost:3001/logout", { method: "POST" });
      setIsWhatsAppConnected(false);
      toast.info("WhatsApp disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const addInventoryToMessage = (phone: Phone) => {
    const phoneText = `\n📱 *${phone.brand} ${phone.model_name}*\n` +
      `• Price: ${formatPrice(phone.selling_price)}\n` +
      `• Condition: ${phone.condition}\n` +
      `• Storage: ${phone.storage}\n` +
      `• Color: ${phone.color}\n`;
    
    setMessage(prev => prev + phoneText);
    toast.success("Added to message");
  };

  const toggleCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id) 
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    if (!isWhatsAppConnected) {
      toast.error("Please connect WhatsApp first");
      return;
    }

    try {
      setSending(true);
      
      // Send to local backend instead of Next.js API for now
      // Or update Next.js API to call local backend
      
      let successCount = 0;
      const total = selectedCustomers.length;
      
      for (let i = 0; i < total; i++) {
        const customerId = selectedCustomers[i];
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
          try {
            // Add random delay between 15-25 seconds if not the first message
            if (i > 0) {
              const delay = Math.floor(Math.random() * (25000 - 15000 + 1) + 15000);
              toast.info(`Waiting ${Math.round(delay/1000)}s before next message...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await fetch("http://localhost:3001/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone: customer.phone,
                message,
              }),
            });
            
            if (response.ok) {
              successCount++;
              toast.success(`Sent to ${customer.name} (${i + 1}/${total})`);
            }
          } catch (err) {
            console.error(`Failed to send to ${customer.name}`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Completed! Message sent to ${successCount} customers.`);
        setMessage("");
        setSelectedCustomers([]);
      } else {
        toast.error("Failed to send messages. Check backend connection.");
      }
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages");
    } finally {
      setSending(false);
    }
  };

  const filteredInventory = inventory.filter(p => 
    p.model_name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Marketing</h1>
          <p className="text-gray-400 mt-1">Send bulk messages to your customers</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isWhatsAppConnected ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1">
              <XCircle className="w-4 h-4 mr-2" />
              Disconnected
            </Badge>
          )}
          
          {isWhatsAppConnected ? (
            <Button variant="destructive" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleConnect}>
              <QrCode className="w-4 h-4 mr-2" />
              Scan WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#111827] border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-white flex justify-between items-center">
                <span>Select Customers</span>
                <Badge variant="secondary">{selectedCustomers.length} selected</Badge>
              </CardTitle>
              <div className="flex gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search customers..." 
                    className="pl-9 bg-[#1f2937] border-gray-700 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px] bg-[#1f2937] border-gray-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md border-gray-800">
                <div className="flex items-center p-3 border-b border-gray-800 bg-[#1f2937]">
                  <Checkbox 
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={toggleAll}
                    className="mr-4 border-gray-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="grid grid-cols-3 flex-1 text-sm font-medium text-gray-400">
                    <span>Name</span>
                    <span>Phone</span>
                    <span>Orders</span>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading customers...
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No customers found
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div 
                        key={customer.id} 
                        className={`flex items-center p-3 border-b border-gray-800 last:border-0 hover:bg-[#1f2937]/50 transition-colors ${
                          selectedCustomers.includes(customer.id) ? "bg-[#1f2937]/80" : ""
                        }`}
                      >
                        <Checkbox 
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => toggleCustomer(customer.id)}
                          className="mr-4 border-gray-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <div className="grid grid-cols-3 flex-1 text-sm text-gray-300">
                          <span className="font-medium text-white">{customer.name}</span>
                          <span>{customer.phone}</span>
                          <span>{customer.total_orders} orders</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Message Composer */}
        <div className="space-y-4">
          <Card className="bg-[#111827] border-gray-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white flex justify-between items-center">
                <span>Compose Message</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setShowInventoryModal(true)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Add Inventory
                </Button>
              </CardTitle>
              <CardDescription>Write your message below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Type your message here..." 
                className="min-h-[200px] bg-[#1f2937] border-gray-700 text-white resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{message.length} characters</span>
                <span>~{Math.ceil(message.length / 160)} segments</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSend}
                disabled={sending || selectedCustomers.length === 0 || !isWhatsAppConnected}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message ({selectedCustomers.length})
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan WhatsApp QR Code</DialogTitle>
            <DialogDescription className="text-gray-400">
              Open WhatsApp on your phone, go to Linked Devices, and scan this code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {isScanning || !qrCode ? (
              <div className="w-64 h-64 bg-white rounded-lg flex flex-col items-center justify-center text-black p-4 text-center">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-2" />
                <p className="text-sm">Waiting for QR Code...</p>
                <p className="text-xs text-gray-500 mt-2">Make sure the backend server is running</p>
              </div>
            ) : (
              <div className="w-64 h-64 bg-white p-4 rounded-lg flex items-center justify-center">
                <QRCodeCanvas 
                  value={qrCode} 
                  size={220}
                  level={"L"}
                />
              </div>
            )}
            <p className="text-sm text-gray-400 text-center">
              {isScanning ? "Connecting to server..." : "Scan with WhatsApp on your phone"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrModal(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inventory Selection Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Inventory to Share</DialogTitle>
            <DialogDescription className="text-gray-400">
              Click on a phone to add its details to your message.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search phones..." 
                className="pl-9 bg-[#1f2937] border-gray-700 text-white"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto border rounded-md border-gray-800">
              {filteredInventory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No phones found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 p-2">
                  {filteredInventory.map((phone) => (
                    <div 
                      key={phone.id} 
                      className="flex items-center justify-between p-3 rounded-md hover:bg-[#1f2937] cursor-pointer transition-colors border border-transparent hover:border-gray-700"
                      onClick={() => addInventoryToMessage(phone)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{phone.brand} {phone.model_name}</p>
                          <p className="text-xs text-gray-400">{phone.storage} • {phone.color} • {phone.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">{formatPrice(phone.selling_price)}</p>
                        <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                          Add +
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInventoryModal(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}