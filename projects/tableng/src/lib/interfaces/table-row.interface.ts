/**
 * Represents a single row of data within the table, extending a generic data object
 * with properties required for tree-grid functionality.
 *
 * @template T The base type for the data object.
 */
export interface TableRow<T> {
  /** The original data for the row. */
  data: T;

  /** The nesting level of the row in the hierarchy, starting from 0. */
  level: number;

  /** Whether the row is currently expanded (if it has children). */
  expanded: boolean;

  /** A list of child rows, forming the hierarchy. */
  children?: TableRow<T>[];

  /** A reference to the parent row, if it exists. */
  parent?: TableRow<T>;
  
  /** Internal flag to control visibility */
  isVisible?: boolean;
} 