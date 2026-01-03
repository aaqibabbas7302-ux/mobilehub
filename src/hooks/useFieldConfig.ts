"use client";

import { useState, useEffect, useCallback } from "react";

export interface FieldConfig {
  id: string;
  table_name: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_system: boolean;
  is_visible: boolean;
  is_required: boolean;
  display_order: number;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  section: string;
}

export function useFieldConfig(tableName: string) {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/field-config?table=${tableName}&visibleOnly=true`);
      const result = await response.json();
      
      if (result.success) {
        setFields(result.fields || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error fetching field config:", err);
      setError("Failed to load field configuration");
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Helper function to check if a field is visible
  const isFieldVisible = useCallback((fieldName: string): boolean => {
    const field = fields.find(f => f.field_name === fieldName);
    // If no config found, default to visible
    return field ? field.is_visible : true;
  }, [fields]);

  // Helper function to check if a field is required
  const isFieldRequired = useCallback((fieldName: string): boolean => {
    const field = fields.find(f => f.field_name === fieldName);
    return field ? field.is_required : false;
  }, [fields]);

  // Helper function to get field label
  const getFieldLabel = useCallback((fieldName: string, defaultLabel?: string): string => {
    const field = fields.find(f => f.field_name === fieldName);
    return field?.field_label || defaultLabel || fieldName;
  }, [fields]);

  // Helper function to get field by name
  const getField = useCallback((fieldName: string): FieldConfig | undefined => {
    return fields.find(f => f.field_name === fieldName);
  }, [fields]);

  // Get visible fields sorted by order
  const visibleFields = fields
    .filter(f => f.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  // Get custom fields only (non-system)
  const customFields = fields
    .filter(f => !f.is_system && f.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return {
    fields,
    visibleFields,
    customFields,
    loading,
    error,
    refetch: fetchFields,
    isFieldVisible,
    isFieldRequired,
    getFieldLabel,
    getField,
  };
}
