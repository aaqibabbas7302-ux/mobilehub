"use client";

import { useState } from "react";
import { 
  Store,
  Bell,
  MessageSquare,
  Shield,
  Save,
  Upload,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="btn-futuristic rounded-xl">
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card rounded-2xl p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Store Info Tab */}
      {activeTab === "store" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-500" />
              Store Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Store Name</Label>
                <Input defaultValue="MobileHub Delhi" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Tagline</Label>
                <Input defaultValue="Premium Second-Hand Phones in Delhi" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Description</Label>
                <Textarea 
                  defaultValue="Delhi's most trusted destination for certified pre-owned smartphones. Quality guaranteed with warranty."
                  className="mt-1 bg-white/5 border-gray-800 rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-500" />
              Store Branding
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold">
                M
              </div>
              <div>
                <Button variant="outline" className="border-gray-800 bg-white/5 hover:bg-white/10 rounded-xl">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-500" />
              Contact Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Phone Number</Label>
                <Input defaultValue="+91 99107 24940" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Email Address</Label>
                <Input defaultValue="contact@mobilehubdelhi.com" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Website</Label>
                <Input defaultValue="https://mobilehubdelhi.com" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Store Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Address</Label>
                <Textarea 
                  defaultValue="123 Mobile Market, Karol Bagh, New Delhi - 110005"
                  className="mt-1 bg-white/5 border-gray-800 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Open Time</Label>
                  <Input defaultValue="10:00 AM" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Close Time</Label>
                  <Input defaultValue="9:00 PM" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="glass-card rounded-2xl p-6 space-y-6 lg:col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              Social Media
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </Label>
                <Input placeholder="@mobilehubdelhi" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2">
                  <Facebook className="w-4 h-4" /> Facebook
                </Label>
                <Input placeholder="MobileHub Delhi" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> Twitter
                </Label>
                <Input placeholder="@mobilehubdelhi" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            {[
              { title: "New Order Alerts", desc: "Get notified when a new order is placed", enabled: true },
              { title: "Inquiry Notifications", desc: "Receive alerts for new customer inquiries", enabled: true },
              { title: "Low Stock Alerts", desc: "Get notified when inventory is running low", enabled: true },
              { title: "Daily Summary", desc: "Receive a daily summary of sales and activity", enabled: false },
              { title: "Marketing Updates", desc: "Tips and updates to grow your business", enabled: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Tab */}
      {activeTab === "whatsapp" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              WhatsApp Business
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">WhatsApp Number</Label>
                <Input defaultValue="+91 99107 24940" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Welcome Message</Label>
                <Textarea 
                  defaultValue="🙏 Namaste! Welcome to MobileHub Delhi. How can I help you find your perfect phone today?"
                  className="mt-1 bg-white/5 border-gray-800 rounded-xl min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">AI Auto-Reply</p>
                  <p className="text-sm text-gray-500">Let AI handle initial customer queries</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              AI Agent Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Agent Name</Label>
                <Input defaultValue="MobileHub Assistant" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Response Language</Label>
                <Input defaultValue="Hindi + English (Hinglish)" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">Suggest Alternatives</p>
                  <p className="text-sm text-gray-500">Suggest similar phones when item unavailable</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* WhatsApp Status */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-500">WhatsApp Connected</p>
                <p className="text-sm text-gray-400">Your WhatsApp Business account is active and receiving messages</p>
              </div>
              <Button variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-500/10 rounded-xl">
                Test Connection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Change Password
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Current Password</Label>
                <Input type="password" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">New Password</Label>
                <Input type="password" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Confirm New Password</Label>
                <Input type="password" className="mt-1 bg-white/5 border-gray-800 rounded-xl" />
              </div>
              <Button className="w-full btn-futuristic rounded-xl">Update Password</Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Security Settings
            </h2>
            
            <div className="space-y-4">
              {[
                { title: "Two-Factor Authentication", desc: "Add an extra layer of security", enabled: false },
                { title: "Login Alerts", desc: "Get notified of new login attempts", enabled: true },
                { title: "Session Timeout", desc: "Auto logout after 30 minutes of inactivity", enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Active Sessions</h2>
            
            <div className="space-y-4">
              {[
                { device: "MacBook Pro", location: "New Delhi, India", time: "Current session", current: true },
                { device: "iPhone 15", location: "New Delhi, India", time: "2 hours ago", current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      💻
                    </div>
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-gray-500">{session.location} • {session.time}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <Badge className="bg-green-500/20 text-green-500 border-0">Current</Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="border-gray-800 text-red-500 hover:bg-red-500/10 rounded-lg">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
