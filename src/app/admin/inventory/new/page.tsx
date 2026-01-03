"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  Smartphone,
  Battery,
  Camera,
  Cpu,
  HardDrive,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
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
import { CustomFieldsForm } from "@/components/custom-fields-form";

interface FieldConfig {
  field_name: string;
  field_label: string;
  is_visible: boolean;
  is_required: boolean;
  is_system: boolean;
}

const conditions = [
  { value: "like_new", label: "Like New", description: "No visible scratches, perfect condition" },
  { value: "excellent", label: "Excellent", description: "Minor scratches, barely noticeable" },
  { value: "good", label: "Good", description: "Visible scratches, fully functional" },
  { value: "fair", label: "Fair", description: "Significant wear, works perfectly" },
];

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];

export default function AddPhonePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  
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
    quantity: "1",
  });

  const [images, setImages] = useState<string[]>([]);
  const [customData, setCustomData] = useState<Record<string, unknown>>({});

  // Fetch field configuration
  useEffect(() => {
    const fetchFieldConfig = async () => {
      try {
        const response = await fetch("/api/field-config?table=phones");
        const result = await response.json();
        if (result.success && result.fields) {
          setFieldConfigs(result.fields);
        }
      } catch (error) {
        console.error("Error fetching field config:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchFieldConfig();
  }, []);

  // Helper to check if field is visible
  const isVisible = (fieldName: string): boolean => {
    const config = fieldConfigs.find(f => f.field_name === fieldName);
    return config ? config.is_visible : true; // Default to visible if no config
  };

  // Helper to check if field is required
  const isRequired = (fieldName: string): boolean => {
    const config = fieldConfigs.find(f => f.field_name === fieldName);
    return config ? config.is_required : false;
  };

  // Helper to get field label
  const getLabel = (fieldName: string, defaultLabel: string): string => {
    const config = fieldConfigs.find(f => f.field_name === fieldName);
    return config ? config.field_label : defaultLabel;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on config
    const requiredFields = fieldConfigs.filter(f => f.is_required && f.is_visible);
    const missingFields = requiredFields.filter(f => {
      const value = formData[f.field_name as keyof typeof formData];
      return !value || value === "";
    });
    
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill in required fields: ${missingFields.map(f => f.field_label).join(", ")}`);
      setSubmitStatus("error");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    
    try {
      const response = await fetch("/api/phones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images,
          custom_data: customData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add phone");
      }
      
      setSubmitStatus("success");
      
      // Redirect to inventory after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/inventory");
      }, 1500);
      
    } catch (error) {
      console.error("Error adding phone:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to add phone");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Phone</h1>
          <p className="text-gray-500 mt-1">Add a new device to your inventory</p>
        </div>
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
                {isVisible("name") && (
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("name", "Phone Name")}
                      {isRequired("name") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., iPhone 15 Pro Max"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required={isRequired("name")}
                    />
                  </div>
                )}

                {isVisible("brand") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("brand", "Brand")}
                      {isRequired("brand") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
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
                )}

                {isVisible("model") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("model", "Model Number")}
                      {isRequired("model") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., A2849"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required={isRequired("model")}
                    />
                  </div>
                )}

                {isVisible("storage") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("storage", "Storage")}
                      {isRequired("storage") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
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
                )}

                {isVisible("color") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("color", "Color")}
                      {isRequired("color") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g., Natural Titanium"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required={isRequired("color")}
                    />
                  </div>
                )}

                {isVisible("imei") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("imei", "IMEI Number")}
                      {isRequired("imei") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      value={formData.imei}
                      onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                      placeholder="15-digit IMEI"
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required={isRequired("imei")}
                    />
                  </div>
                )}

                {isVisible("quantity") && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">
                      {getLabel("quantity", "Quantity")}
                      {isRequired("quantity") && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="bg-white/5 border-gray-800 rounded-xl h-12"
                      required={isRequired("quantity")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Condition */}
            {(isVisible("condition") || isVisible("batteryHealth")) && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-500" />
                Condition & Health
              </h2>
              
              <div className="space-y-6">
                {isVisible("condition") && (
                <div>
                  <Label className="text-gray-400 mb-3 block">
                    {getLabel("condition", "Device Condition")}
                    {isRequired("condition") && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
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
                )}

                {isVisible("batteryHealth") && (
                <div>
                  <Label className="text-gray-400 mb-2 block">
                    {getLabel("batteryHealth", "Battery Health (%)")}
                    {isRequired("batteryHealth") && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryHealth}
                    onChange={(e) => setFormData({ ...formData, batteryHealth: e.target.value })}
                    placeholder="e.g., 95"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required={isRequired("batteryHealth")}
                  />
                </div>
                )}
              </div>
            </div>
            )}

            {/* Pricing */}
            {(isVisible("price") || isVisible("originalPrice") || isVisible("cost")) && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Pricing</h2>
              
              <div className="grid sm:grid-cols-3 gap-6">
                {isVisible("price") && (
                <div>
                  <Label className="text-gray-400 mb-2 block">
                    {getLabel("price", "Selling Price (₹)")}
                    {isRequired("price") && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="89999"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required={isRequired("price")}
                  />
                </div>
                )}
                {isVisible("originalPrice") && (
                <div>
                  <Label className="text-gray-400 mb-2 block">
                    {getLabel("originalPrice", "Original Price (₹)")}
                    {isRequired("originalPrice") && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="159900"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required={isRequired("originalPrice")}
                  />
                </div>
                )}
                {isVisible("cost") && (
                <div>
                  <Label className="text-gray-400 mb-2 block">
                    {getLabel("cost", "Cost Price (₹)")}
                    {isRequired("cost") && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="75000"
                    className="bg-white/5 border-gray-800 rounded-xl h-12"
                    required={isRequired("cost")}
                  />
                </div>
                )}
              </div>

              {isVisible("price") && isVisible("originalPrice") && formData.price && formData.originalPrice && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-500 text-sm">
                    Discount: {Math.round((1 - parseInt(formData.price) / parseInt(formData.originalPrice)) * 100)}% off
                  </p>
                </div>
              )}
            </div>
            )}

            {/* Description */}
            {isVisible("description") && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">
                {getLabel("description", "Description")}
              </h2>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a detailed description of the phone's condition, included accessories, and any special notes..."
                className="bg-white/5 border-gray-800 rounded-xl min-h-[150px] resize-none"
                required={isRequired("description")}
              />
            </div>
            )}

            {/* Custom Fields */}
            <CustomFieldsForm 
              entityType="phones"
              values={customData}
              onChange={setCustomData}
            />
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
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-6xl">
                  📱
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

                {formData.condition && (
                  <Badge className="bg-white/10 text-gray-300 border-0">
                    {conditions.find(c => c.value === formData.condition)?.label}
                  </Badge>
                )}
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
                <p className="text-green-500 text-sm">Phone added successfully! Redirecting...</p>
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
                    Adding Phone...
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Phone
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
