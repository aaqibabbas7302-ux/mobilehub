"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Smartphone,
  Battery,
  Shield,
  IndianRupee,
  Camera,
  Fingerprint,
  Volume2,
  Wifi,
  Bluetooth,
  Plug,
} from "lucide-react";
import Link from "next/link";
import { POPULAR_BRANDS, CONDITION_DESCRIPTIONS } from "@/lib/utils";

const conditionGrades = ['A+', 'A', 'B+', 'B', 'C', 'D'] as const;
const warrantyTypes = ['No Warranty', '30 Days', '60 Days', '90 Days', 'Brand Warranty'] as const;
const statusOptions = ['Available', 'Reserved', 'Under Repair', 'Quality Check', 'Listed Online'] as const;

export default function AddPhonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: "",
    model_name: "",
    model_number: "",
    variant: "",
    color: "",
    imei_1: "",
    imei_2: "",
    condition_grade: "A",
    screen_condition: "Good",
    body_condition: "Good",
    battery_health_percent: 85,
    cost_price: "",
    selling_price: "",
    original_mrp: "",
    warranty_type: "30 Days",
    status: "Available",
    location: "Store",
    // Functional tests
    face_id_working: true,
    fingerprint_working: true,
    buttons_working: true,
    speakers_working: true,
    microphone_working: true,
    cameras_working: "Both",
    wifi_working: true,
    bluetooth_working: true,
    charging_port_condition: "Good",
    // Other
    is_refurbished: false,
    refurbishment_details: "",
    original_invoice_available: false,
    imei_verified: false,
    accessories_included: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Submit to Supabase
    console.log("Form data:", formData);
    
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/inventory");
    }, 1000);
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Phone</h2>
          <p className="text-gray-600 mt-1">Enter the details of the phone to add to inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the phone&apos;s basic details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select value={formData.brand} onValueChange={(v) => updateField("brand", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_name">Model Name *</Label>
              <Input
                id="model_name"
                placeholder="e.g., iPhone 13 Pro"
                value={formData.model_name}
                onChange={(e) => updateField("model_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Variant (RAM/Storage)</Label>
              <Input
                id="variant"
                placeholder="e.g., 8GB/128GB"
                value={formData.variant}
                onChange={(e) => updateField("variant", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Midnight Black"
                value={formData.color}
                onChange={(e) => updateField("color", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei_1">IMEI 1 *</Label>
              <Input
                id="imei_1"
                placeholder="15-digit IMEI"
                value={formData.imei_1}
                onChange={(e) => updateField("imei_1", e.target.value)}
                maxLength={15}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei_2">IMEI 2 (Dual SIM)</Label>
              <Input
                id="imei_2"
                placeholder="15-digit IMEI"
                value={formData.imei_2}
                onChange={(e) => updateField("imei_2", e.target.value)}
                maxLength={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Condition Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Condition Assessment
            </CardTitle>
            <CardDescription>Rate the phone&apos;s physical and functional condition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Condition Grade *</Label>
                <Select value={formData.condition_grade} onValueChange={(v) => updateField("condition_grade", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionGrades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade} - {CONDITION_DESCRIPTIONS[grade]?.split(' - ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{CONDITION_DESCRIPTIONS[formData.condition_grade]}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery Health *
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.battery_health_percent}
                    onChange={(e) => updateField("battery_health_percent", parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-gray-600">%</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        formData.battery_health_percent >= 80 ? 'bg-green-500' :
                        formData.battery_health_percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${formData.battery_health_percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Screen Condition</Label>
                <Select value={formData.screen_condition} onValueChange={(v) => updateField("screen_condition", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Perfect">Perfect - No scratches</SelectItem>
                    <SelectItem value="Good">Good - Minor scratches</SelectItem>
                    <SelectItem value="Fair">Fair - Visible scratches</SelectItem>
                    <SelectItem value="Poor">Poor - Cracks/Dead pixels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body Condition</Label>
                <Select value={formData.body_condition} onValueChange={(v) => updateField("body_condition", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent - Like new</SelectItem>
                    <SelectItem value="Good">Good - Minor wear</SelectItem>
                    <SelectItem value="Fair">Fair - Visible wear</SelectItem>
                    <SelectItem value="Poor">Poor - Dents/Damage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Functional Tests */}
            <div>
              <Label className="text-base font-medium mb-4 block">Functional Tests</Label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Fingerprint</p>
                  </div>
                  <Checkbox
                    checked={formData.fingerprint_working}
                    onCheckedChange={(v) => updateField("fingerprint_working", v)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Face ID</p>
                  </div>
                  <Checkbox
                    checked={formData.face_id_working}
                    onCheckedChange={(v) => updateField("face_id_working", v)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Speakers</p>
                  </div>
                  <Checkbox
                    checked={formData.speakers_working}
                    onCheckedChange={(v) => updateField("speakers_working", v)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Wifi className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">WiFi</p>
                  </div>
                  <Checkbox
                    checked={formData.wifi_working}
                    onCheckedChange={(v) => updateField("wifi_working", v)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Bluetooth className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bluetooth</p>
                  </div>
                  <Checkbox
                    checked={formData.bluetooth_working}
                    onCheckedChange={(v) => updateField("bluetooth_working", v)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Plug className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Charging Port</p>
                  </div>
                  <Select value={formData.charging_port_condition} onValueChange={(v) => updateField("charging_port_condition", v)}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Loose">Loose</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="w-5 h-5" />
              Pricing
            </CardTitle>
            <CardDescription>Set the purchase and selling prices</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="cost_price"
                  type="number"
                  placeholder="25000"
                  value={formData.cost_price}
                  onChange={(e) => updateField("cost_price", e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Price you paid for this phone</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="selling_price"
                  type="number"
                  placeholder="29999"
                  value={formData.selling_price}
                  onChange={(e) => updateField("selling_price", e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Your selling price</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_mrp">Original MRP (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  id="original_mrp"
                  type="number"
                  placeholder="45000"
                  value={formData.original_mrp}
                  onChange={(e) => updateField("original_mrp", e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500">For showing discount</p>
            </div>
          </CardContent>
        </Card>

        {/* Status & Warranty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Warranty</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Warranty</Label>
              <Select value={formData.warranty_type} onValueChange={(v) => updateField("warranty_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warrantyTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={formData.location} onValueChange={(v) => updateField("location", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store">Store</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Display">Display</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Accessories Included</Label>
              <Input
                placeholder="Charger, Box, Earphones"
                value={formData.accessories_included}
                onChange={(e) => updateField("accessories_included", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="imei_verified"
                  checked={formData.imei_verified}
                  onCheckedChange={(v) => updateField("imei_verified", v)}
                />
                <Label htmlFor="imei_verified" className="text-sm font-normal cursor-pointer">
                  IMEI Verified on CEIR
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="original_invoice"
                  checked={formData.original_invoice_available}
                  onCheckedChange={(v) => updateField("original_invoice_available", v)}
                />
                <Label htmlFor="original_invoice" className="text-sm font-normal cursor-pointer">
                  Original Invoice Available
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_refurbished"
                  checked={formData.is_refurbished}
                  onCheckedChange={(v) => updateField("is_refurbished", v)}
                />
                <Label htmlFor="is_refurbished" className="text-sm font-normal cursor-pointer">
                  Refurbished
                </Label>
              </div>
            </div>

            {formData.is_refurbished && (
              <div className="sm:col-span-2 space-y-2">
                <Label>Refurbishment Details</Label>
                <Textarea
                  placeholder="Describe what was replaced or repaired..."
                  value={formData.refurbishment_details}
                  onChange={(e) => updateField("refurbishment_details", e.target.value)}
                />
              </div>
            )}

            <div className="sm:col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes about this phone..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/inventory">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Phone"}
          </Button>
        </div>
      </form>
    </div>
  );
}
