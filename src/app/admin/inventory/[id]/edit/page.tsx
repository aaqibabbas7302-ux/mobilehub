"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Smartphone,
  Battery,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_BRANDS } from "@/lib/utils";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import { createClient } from "@/lib/supabase/client";

const conditions = [
  { value: "A+", label: "Like New", description: "No visible scratches, perfect condition" },
  { value: "A", label: "Excellent", description: "Minor scratches, barely noticeable" },
  { value: "B+", label: "Very Good", description: "Light scratches, fully functional" },
  { value: "B", label: "Good", description: "Visible scratches, fully functional" },
  { value: "C", label: "Fair", description: "Significant wear, works perfectly" },
  { value: "D", label: "Acceptable", description: "Heavy wear, functional" },
];

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const statusOptions = ["Available", "Reserved", "Sold", "Under Repair", "Quality Check"];

export default function EditPhonePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    originalPrice: "",
    cost: "",
    storage: "",
    color: "",
    condition: "",
    imei: "",
    batteryHealth: "",
    description: "",
    status: "Available",
  });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchPhone(params.id as string);
    }
  }, [params.id]);

  const fetchPhone = async (id: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("phones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.model_name || "",
          brand: data.brand || "",
          model: data.model_number || "",
          price: data.selling_price_paise ? (data.selling_price_paise / 100).toString() : "",
          originalPrice: data.original_mrp_paise ? (data.original_mrp_paise / 100).toString() : "",
          cost: data.cost_price_paise ? (data.cost_price_paise / 100).toString() : "",
          storage: data.variant || "",
          color: data.color || "",
          condition: data.condition_grade || "",
          imei: data.imei_1 || "",
          batteryHealth: data.battery_health_percent?.toString() || "",
          description: data.description || "",
          status: data.status || "Available",
        });
        setImages(data.images || []);
      }
    } catch (err) {
      console.error("Error fetching phone:", err);
      setErrorMessage("Phone not found");
      setSubmitStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.price || !formData.imei) {
      setErrorMessage("Please fill in all required fields (Name, Brand, Price, IMEI)");
      setSubmitStatus("error");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    
    try {
      const response = await fetch(`/api/phones/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update phone");
      }
      
      setSubmitStatus("success");
      
      setTimeout(() => {
        router.push("/admin/inventory");
      }, 1500);
      
    } catch (error) {
      console.error("Error updating phone:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to update phone");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this phone? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/phones/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete phone");
      }
      
      router.push("/admin/inventory");
    } catch (error) {
      console.error("Error deleting phone:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete phone");
      setSubmitStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inventory">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Phone</h1>
            <p className="text-gray-500 mt-1">Update device information</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                Basic Information
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <Label className="text-gray-400 mb-2 block">Phone Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., iPhone 15 Pro Max"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Brand *</Label>
                  <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                    <SelectTrigger className="bg-white/5 border-gray-800 rounded-xl h-12">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {POPULAR_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Model Number</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., A2849"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Storage</Label>
                  <Select value={formData.storage} onValueChange={(v) => setFormData({ ...formData, storage: v })}>
                    <SelectTrigger className="bg-white/5 border-gray-800 rounded-xl h-12">
                      <SelectValue placeholder="Select storage" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {storageOptions.map((storage) => (
                        <SelectItem key={storage} value={storage}>{storage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., Natural Titanium"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">IMEI Number *</Label>
                  <Input
                    value={formData.imei}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                    placeholder="15-digit IMEI"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-white/5 border-gray-800 rounded-xl h-12">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-500" />
                Condition & Health
              </h2>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-400 mb-3 block">Device Condition</Label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {conditions.map((condition) => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: condition.value })}
                        className={`p-4 rounded-xl text-left transition-all ${
                          formData.condition === condition.value
                            ? 'bg-orange-500/20 border-2 border-orange-500'
                            : 'bg-white/5 border-2 border-transparent hover:border-gray-700'
                        }`}
                      >
                        <p className="font-semibold">{condition.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{condition.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Battery Health (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryHealth}
                    onChange={(e) => setFormData({ ...formData, batteryHealth: e.target.value })}
                    placeholder="e.g., 95"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Pricing</h2>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <Label className="text-gray-400 mb-2 block">Selling Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="89999"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-400 mb-2 block">Original Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="159900"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>
                <div>
                  <Label className="text-gray-400 mb-2 block">Cost Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="75000"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                  />
                </div>
              </div>

              {formData.price && formData.originalPrice && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-500 text-sm">
                    Discount: {Math.round((1 - parseInt(formData.price) / parseInt(formData.originalPrice)) * 100)}% off
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Description</h2>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a detailed description of the phone's condition, included accessories, and any special notes..."
                className="bg-white/5 border-gray-800 rounded-xl min-h-[150px] resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Product Images</h2>
              
              <CloudinaryUpload
                onUpload={(urls) => setImages(urls)}
                folder="mobilehub-delhi/phones"
                maxFiles={5}
                existingImages={images}
              />
            </div>

            {/* Quick Preview */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Quick Preview</h2>
              
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                  {images[0] ? (
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">📱</span>
                  )}
                </div>
                
                <div>
                  <p className="font-bold">{formData.name || "Phone Name"}</p>
                  <p className="text-sm text-gray-500">{formData.brand || "Brand"} • {formData.storage || "Storage"}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-500">
                    {formData.price ? `₹${parseInt(formData.price).toLocaleString()}` : "₹0"}
                  </span>
                  {formData.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{parseInt(formData.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {formData.condition && (
                    <Badge className="bg-white/10 text-gray-300 border-0">
                      {conditions.find(c => c.value === formData.condition)?.label}
                    </Badge>
                  )}
                  <Badge className={`border-0 ${
                    formData.status === "Available" ? "bg-green-500/20 text-green-500" :
                    formData.status === "Sold" ? "bg-gray-500/20 text-gray-500" :
                    "bg-yellow-500/20 text-yellow-500"
                  }`}>
                    {formData.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus === "error" && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-500 text-sm">{errorMessage}</p>
              </div>
            )}
            
            {submitStatus === "success" && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-green-500 text-sm">Phone updated successfully! Redirecting...</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                disabled={isSubmitting || submitStatus === "success"}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 border-0 py-6 rounded-xl text-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href="/admin/inventory">
                <Button variant="outline" className="w-full border-gray-800 bg-white/5 hover:bg-white/10 py-6 rounded-xl">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
