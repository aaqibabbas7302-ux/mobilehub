"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings2, Loader2 } from "lucide-react";

interface CustomField {
  id: string;
  table_name: string;
  field_name: string;
  field_label: string;
  field_type: string;
  options: string[] | { label: string; value: string }[] | null;
  required?: boolean;
  is_required?: boolean;
  is_system?: boolean;
  is_visible?: boolean;
}

interface CustomFieldsFormProps {
  entityType: "phones" | "customers" | "orders" | "inquiries";
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function CustomFieldsForm({ entityType, values, onChange }: CustomFieldsFormProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, [entityType]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      
      // Try field-config API first (for configured custom fields)
      const configResponse = await fetch(`/api/field-config?table=${entityType}&visibleOnly=true`);
      const configResult = await configResponse.json();
      
      if (configResult.success && configResult.fields) {
        // Filter only non-system (custom) fields
        const customFields = configResult.fields
          .filter((f: CustomField) => !f.is_system && f.is_visible !== false)
          .map((f: CustomField) => ({
            ...f,
            required: f.is_required || false,
          }));
        
        if (customFields.length > 0) {
          setFields(customFields);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to legacy custom-fields API
      const response = await fetch(`/api/custom-fields?table=${entityType}`);
      const result = await response.json();
      
      if (result.fields) {
        setFields(result.fields);
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName: string, value: unknown) => {
    onChange({ ...values, [fieldName]: value });
  };

  // Helper to get option value from options array (supports both string[] and object[])
  const getOptionValue = (option: string | { label: string; value: string }): string => {
    return typeof option === 'string' ? option : option.value;
  };

  const getOptionLabel = (option: string | { label: string; value: string }): string => {
    return typeof option === 'string' ? option : option.label;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  if (fields.length === 0) {
    return null;
  }

  const isRequired = (field: CustomField) => field.required || field.is_required;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-orange-500" />
        Custom Fields
      </h2>
      
      <div className="grid sm:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.id} className={field.field_type === "textarea" ? "sm:col-span-2" : ""}>
            <Label className="text-gray-400 mb-2 block">
              {field.field_label}
              {isRequired(field) && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {field.field_type === "text" && (
              <Input
                value={(values[field.field_name] as string) || ""}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                placeholder={`Enter ${field.field_label.toLowerCase()}`}
                className="bg-white/5 border-gray-800 rounded-xl h-12"
                required={isRequired(field)}
              />
            )}
            
            {field.field_type === "number" && (
              <Input
                type="number"
                value={(values[field.field_name] as string) || ""}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                placeholder={`Enter ${field.field_label.toLowerCase()}`}
                className="bg-white/5 border-gray-800 rounded-xl h-12"
                required={isRequired(field)}
              />
            )}
            
            {field.field_type === "date" && (
              <Input
                type="date"
                value={(values[field.field_name] as string) || ""}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                className="bg-white/5 border-gray-800 rounded-xl h-12"
                required={isRequired(field)}
              />
            )}
            
            {field.field_type === "textarea" && (
              <Textarea
                value={(values[field.field_name] as string) || ""}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                placeholder={`Enter ${field.field_label.toLowerCase()}`}
                className="bg-white/5 border-gray-800 rounded-xl min-h-[100px]"
                required={isRequired(field)}
              />
            )}
            
            {field.field_type === "boolean" && (
              <div className="flex items-center gap-3 h-12">
                <Switch
                  checked={(values[field.field_name] as boolean) || false}
                  onCheckedChange={(checked) => handleChange(field.field_name, checked)}
                />
                <span className="text-gray-400 text-sm">
                  {values[field.field_name] ? "Yes" : "No"}
                </span>
              </div>
            )}
            
            {field.field_type === "select" && field.options && (
              <select
                value={(values[field.field_name] as string) || ""}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                className="w-full bg-white/5 border border-gray-800 rounded-xl h-12 px-3 text-white"
                required={isRequired(field)}
              >
                <option value="" className="bg-gray-900">Select {field.field_label}</option>
                {field.options.map((option, idx) => (
                  <option key={idx} value={getOptionValue(option)} className="bg-gray-900">
                    {getOptionLabel(option)}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
