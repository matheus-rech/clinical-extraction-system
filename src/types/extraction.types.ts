/**
 * Type definitions for extraction system
 */

export interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Extraction {
  id: string;
  timestamp: string;
  fieldName: string;
  text: string;
  page: number;
  coordinates: Coordinates;
  method: 'manual' | 'markdown-search';
  documentName: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'doi' | 'pmid' | 'year';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface FormValidationResult {
  valid: boolean;
  errors: Map<string, string>;
}

export interface ExportData {
  document: string;
  exportDate: string;
  formData: Record<string, string>;
  extractions: Extraction[];
}
