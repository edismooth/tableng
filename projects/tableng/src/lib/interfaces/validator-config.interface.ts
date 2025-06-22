/**
 * Configuration for a single validator.
 */
export interface ValidatorConfig {
  /** The type of validator (e.g., 'required', 'minLength', 'custom') */
  type: string;
  
  /** The validation function. Returns true if valid, false if invalid. */
  validator: (value: any) => boolean;
  
  /** The error message to display if validation fails. */
  message: string;
} 