import { ColumnDefinition } from './column-definition.interface';
import { TableTheme } from './table-theme.interface';

/**
 * Configuration for sticky columns behavior
 */
export interface StickyColumns {
  /** Number of columns to stick to the left */
  left?: number;
  /** Number of columns to stick to the right */
  right?: number;
}

/**
 * Main configuration interface for TableNG component
 */
export interface TableConfig {
  /** Unique identifier for the table (used for localStorage persistence) */
  tableId: string;
  
  /** Column definitions for the table */
  columns: ColumnDefinition[];
  
  /** Enable virtual scrolling for large datasets */
  virtualScrolling?: boolean;
  
  /** Keep headers visible during vertical scrolling */
  stickyHeaders?: boolean;
  
  /** Configure sticky columns for horizontal scrolling */
  stickyColumns?: StickyColumns;
  
  /** Theme configuration (string name or theme object) */
  theme?: string | TableTheme;
  
  /** Enable inline editing capabilities */
  editable?: boolean;
  
  /** Enable tree/hierarchical mode */
  treeMode?: boolean;
  
  /** Enable column filtering */
  filtering?: boolean;
  
  /** Enable column sorting */
  sorting?: boolean;
  
  /** Enable column resizing */
  resizable?: boolean;
  
  /** Enable column reordering via drag & drop */
  reorderable?: boolean;
  
  /** Default row height in pixels */
  rowHeight?: number;
  
  /** Header row height in pixels */
  headerHeight?: number;
} 