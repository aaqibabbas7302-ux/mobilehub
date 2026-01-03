"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldConfig } from "@/hooks/useFieldConfig";

interface DynamicFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

export function DynamicField({ field, value, onChange, className = "" }: DynamicFieldProps) {
  const baseInputClass = "bg-white/5 border-gray-800 rounded-xl";
  
  const renderField = () => {
    switch (field.field_type) {
      case "text":
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            className={`${baseInputClass} ${className}`}
            required={field.is_required}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            className={`${baseInputClass} ${className}`}
            required={field.is_required}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClass} ${className}`}
            required={field.is_required}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            className={`${baseInputClass} min-h-[100px] ${className}`}
            required={field.is_required}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => onChange(checked)}
              className="border-gray-600"
            />
            <span className="text-sm text-gray-400">
              {field.placeholder || `Enable ${field.field_label.toLowerCase()}`}
            </span>
          </div>
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-2 ${baseInputClass} text-white ${className}`}
            required={field.is_required}
          >
            <option value="" className="bg-gray-900">
              Select {field.field_label}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            className={`${baseInputClass} ${className}`}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-gray-400 text-sm">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}

interface DynamicFieldsRendererProps {
  tableName: string;
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  excludeFields?: string[];
  className?: string;
}

export function DynamicFieldsRenderer({
  tableName,
  values,
  onChange,
  excludeFields = [],
  className = ""
}: DynamicFieldsRendererProps) {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch(`/api/field-config?table=${tableName}&visibleOnly=true`);
        const result = await response.json();
        
        if (result.success) {
          // Filter out system fields since those are rendered manually
          // Only render custom (non-system) fields dynamically
          const customFields = (result.fields || [])
            .filter((f: FieldConfig) => !f.is_system && !excludeFields.includes(f.field_name))
            .sort((a: FieldConfig, b: FieldConfig) => a.display_order - b.display_order);
          setFields(customFields);
        }
      } catch (error) {
        console.error("Error fetching field config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [tableName, excludeFields]);

  if (loading) {
    return null;
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {fields.length > 0 && (
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-sm font-medium text-orange-500 mb-4">Custom Fields</h3>
          <div className="grid gap-4">
            {fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={values[field.field_name]}
                onChange={(value) => onChange(field.field_name, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to use with forms - validates required fields
export function useFormFieldValidation(tableName: string) {
  const [fields, setFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch(`/api/field-config?table=${tableName}&visibleOnly=true`);
        const result = await response.json();
        
        if (result.success) {
          setFields(result.fields || []);
        }
      } catch (error) {
        console.error("Error fetching field config:", error);
      }
    };

    fetchFields();
  }, [tableName]);

  const validateForm = useCallback((values: Record<string, any>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    fields
      .filter(f => f.is_visible && f.is_required)
      .forEach(field => {
        const value = values[field.field_name];
        if (value === undefined || value === null || value === "") {
          errors.push(`${field.field_label} is required`);
        }
      });

    return { valid: errors.length === 0, errors };
  }, [fields]);

  return { fields, validateForm };
}
