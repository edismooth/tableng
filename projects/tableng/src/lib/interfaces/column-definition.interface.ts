import { CellEditConfig } from './cell-edit-config.interface';

/**
 * Supported column data types
 */
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';

/**
 * Sort direction options
 */
export type SortDirection = 'asc' | 'desc' | 'none';

/**
 * Column definition interface for table configuration
 */
export interface ColumnDefinition {
  /** Unique key for the column (maps to data property) */
  key: string;
  
  /** Display title for the column header */
  title: string;
  
  /** Data type of the column */
  type: ColumnType;
  
  /** Column width in pixels */
  width?: number;
  
  /** Minimum column width in pixels */
  minWidth?: number;
  
  /** Maximum column width in pixels */
  maxWidth?: number;
  
  /** Whether the column can be resized */
  resizable?: boolean;
  
  /** Whether the column can be sorted */
  sortable?: boolean;
  
  /** Whether the column can be filtered */
  filterable?: boolean;
  
  /** Whether the column is visible */
  visible?: boolean;
  
  /** Current sort direction */
  sortDirection?: SortDirection;
  
  /** Current filter value */
  filterValue?: string;
  
  /** CSS class for the column */
  cssClass?: string;
  
  /** CSS class for the header cell */
  headerCssClass?: string;
  
  /** CSS class for data cells */
  cellCssClass?: string;
  
  /** Whether the column supports inline editing */
  editable?: boolean;
  
  /** Edit configuration for the column */
  editConfig?: CellEditConfig;
  
  /** Custom formatter function for displaying values */
  formatter?: (value: unknown) => string;
  
  /** Custom validator function for cell values */
  validator?: (value: unknown) => boolean;
} 