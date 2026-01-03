"use client";

import { useState, useEffect } from "react";
import { 
  Plus,
  Trash2,
  Loader2,
  Settings2,
  Save,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft,
  AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CustomField {
  id: string;
  table_name: string;
  field_name: string;
  field_label: string;
  field_type: string;
  options: string[] | null;
  required: boolean;
  created_at: string;
}

const fieldTypeIcons: Record<string, any> = {
  text: Type,
  number: Hash,
  date: Calendar,
  select: List,
  checkbox: ToggleLeft,
  textarea: AlignLeft,
};

const tableLabels: Record<string, string> = {
  phones: "Inventory",
  customers: "Customers",
  orders: "Orders",
  inquiries: "Inquiries",
};

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("phones");
  const [newField, setNewField] = useState({
    field_name: "",
    field_label: "",
    field_type: "text",
    options: "",
    required: false,
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/custom-fields");
      const data = await response.json();
      if (data.fields) {
        setFields(data.fields);
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast.error("Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.field_name.trim() || !newField.field_label.trim()) {
      toast.error("Field name and label are required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_name: activeTab,
          field_name: newField.field_name,
          field_label: newField.field_label,
          field_type: newField.field_type,
          options: newField.field_type === "select" ? newField.options.split(",").map(o => o.trim()) : null,
          required: newField.required,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Custom field added successfully");
        setShowAddModal(false);
        setNewField({ field_name: "", field_label: "", field_type: "text", options: "", required: false });
        fetchFields();
      } else {
        toast.error(data.error || "Failed to add field");
      }
    } catch (error) {
      console.error("Error adding custom field:", error);
      toast.error("Failed to add field");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;

    try {
      const response = await fetch(`/api/custom-fields?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Field deleted successfully");
        setFields(fields.filter(f => f.id !== id));
      } else {
        toast.error("Failed to delete field");
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field");
    }
  };

  const getFieldsForTable = (tableName: string) => {
    return fields.filter(f => f.table_name === tableName);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings2 className="w-8 h-8" />
            Custom Fields
          </h1>
          <p className="text-gray-400 mt-1">Add custom fields to extend your data model</p>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-gradient-to-r from-orange-500 to-red-600 border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Field
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1f2937]">
          <TabsTrigger value="phones">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        {["phones", "customers", "orders", "inquiries"].map((tableName) => (
          <TabsContent key={tableName} value={tableName} className="mt-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">{tableLabels[tableName]} Fields</h2>
                <Badge variant="secondary">{getFieldsForTable(tableName).length} custom fields</Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : getFieldsForTable(tableName).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No custom fields added yet</p>
                  <p className="text-sm mt-1">Click "Add Custom Field" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFieldsForTable(tableName).map((field) => {
                    const IconComponent = fieldTypeIcons[field.field_type] || Type;
                    return (
                      <div 
                        key={field.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-[#1f2937] border border-gray-800"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gray-800">
                            <IconComponent className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{field.field_label}</p>
                            <p className="text-xs text-gray-500">
                              {field.field_name} • {field.field_type}
                              {field.required && <span className="text-red-400 ml-2">• Required</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {field.options && (
                            <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                              {field.options.length} options
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Field Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new field to {tableLabels[activeTab]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input
                placeholder="e.g., Serial Number"
                className="bg-[#1f2937] border-gray-700 text-white"
                value={newField.field_label}
                onChange={(e) => setNewField({ ...newField, field_label: e.target.value, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              />
            </div>

            <div className="space-y-2">
              <Label>Field Name (Internal)</Label>
              <Input
                placeholder="e.g., serial_number"
                className="bg-[#1f2937] border-gray-700 text-white font-mono text-sm"
                value={newField.field_name}
                onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select 
                value={newField.field_type} 
                onValueChange={(value) => setNewField({ ...newField, field_type: value })}
              >
                <SelectTrigger className="bg-[#1f2937] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-gray-700">
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newField.field_type === "select" && (
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input
                  placeholder="Option 1, Option 2, Option 3"
                  className="bg-[#1f2937] border-gray-700 text-white"
                  value={newField.options}
                  onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Required Field</Label>
              <Switch
                checked={newField.required}
                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddField} 
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Field
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
