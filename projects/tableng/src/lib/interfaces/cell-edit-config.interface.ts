import { ValidatorConfig } from './validator-config.interface';

/**
 * Supported edit types for inline editing
 */
export type EditType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom';

/**
 * Validation rules for cell editing
 */
export interface ValidationRules {
  /** Field is required */
  required?: boolean;
  /** Minimum length for text inputs */
  minLength?: number;
  /** Maximum length for text inputs */
  maxLength?: number;
  /** Regex pattern for validation */
  pattern?: RegExp;
  /** Custom validation function */
  customValidator?: (value: unknown) => boolean;
}

/**
 * Option for select dropdowns
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option display label */
  label: string;
}

/**
 * Configuration for inline cell editing
 */
export interface CellEditConfig {
  /** Type of editor to use */
  type: EditType;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Placeholder text for the editor */
  placeholder?: string;
  
  /** Options for select/dropdown editors */
  options?: string[] | SelectOption[];
  
  /** Minimum length for text inputs */
  minLength?: number;

  /** Maximum length for text inputs */
  maxLength?: number;

  /** Regex pattern for validation */
  pattern?: string;

  /** Array of validator configurations */
  validators?: ValidatorConfig[];
  
  /** Whether the editor is disabled */
  disabled?: boolean;
  
  /** Whether the editor is read-only */
  readonly?: boolean;
} 