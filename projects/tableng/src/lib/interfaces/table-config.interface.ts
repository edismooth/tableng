import { ColumnDefinition } from './column-definition.interface';
import { TableTheme } from './table-theme.interface';

/**
 * Configuration interface for sticky columns
 * Defines which columns should remain fixed during horizontal scrolling
 */
export interface StickyColumns {
  /** Number of columns to keep fixed on the left side */
  left?: number;
  /** Number of columns to keep fixed on the right side */
  right?: number;
}

/**
 * Main configuration interface for table behavior and appearance
 * Controls all aspects of table functionality including scrolling, editing, selection, and layout
 */
export interface TableConfig {
  /** Unique identifier for the table instance */
  tableId: string;
  
  /** Array of column definitions that define table structure */
  columns: ColumnDefinition[];
  
  /** Enable virtual scrolling for performance with large datasets */
  virtualScrolling?: boolean;
  
  /** Keep headers visible when scrolling vertically */
  stickyHeaders?: boolean;
  
  /** Configuration for sticky columns during horizontal scrolling */
  stickyColumns?: StickyColumns;
  
  /** Theme configuration for visual customization */
  theme?: TableTheme | string;
  
  /** Enable inline editing functionality */
  editable?: boolean;
  
  /** Enable row selection functionality */
  selectable?: boolean;
  
  /** Enable tree/hierarchical mode for nested data */
  treeMode?: boolean;
  
  /** Enable filtering capabilities */
  filtering?: boolean;
  
  /** Enable sorting capabilities */
  sorting?: boolean;
  
  /** Enable column resizing */
  resizable?: boolean;
  
  /** Enable column reordering */
  reorderable?: boolean;
  
  /** Custom CSS class to apply to the table */
  cssClass?: string;
  
  /** Fixed height for the table container (enables scrolling) */
  height?: number;
  
  /** Fixed width for the table container */
  width?: number;
  
  /** Height of table header in pixels */
  headerHeight?: number;
  
  /** Default height for data rows in pixels */
  rowHeight?: number;
} 