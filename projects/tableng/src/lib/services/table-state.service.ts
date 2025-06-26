import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig } from '../interfaces/table-config.interface';
import { ColumnDefinition, SortDirection } from '../interfaces/column-definition.interface';
import { LocalStorageService, TableState } from './local-storage.service';
import { TableRow } from '../interfaces/table-row.interface';

/**
 * Sort state for a column
 */
export interface SortState {
  column: string;
  direction: Exclude<SortDirection, 'none'>;
}

/**
 * Filter state for table columns
 */
export type FilterState = Record<string, string>;

/**
 * Service for managing table state including data, sorting, filtering, and column configuration
 * Integrates with LocalStorageService for state persistence
 */
@Injectable({
  providedIn: 'root'
})
export class TableStateService {
  // State subjects
  private readonly configSubject = new BehaviorSubject<TableConfig | null>(null);
  private readonly dataSubject = new BehaviorSubject<TableRow<any>[]>([]);
  private readonly visibleDataSubject = new BehaviorSubject<TableRow<any>[]>([]);
  private readonly sortStateSubject = new BehaviorSubject<SortState | null>(null);
  private readonly filterStateSubject = new BehaviorSubject<FilterState>({});

  // Observable streams
  readonly config$ = this.configSubject.asObservable();
  readonly data$ = this.dataSubject.asObservable();
  readonly visibleData$ = this.visibleDataSubject.asObservable();
  readonly sortState$ = this.sortStateSubject.asObservable();
  readonly filterState$ = this.filterStateSubject.asObservable();

  // Internal state
  private originalData: TableRow<any>[] = [];
  private currentConfig: TableConfig | null = null;
  private columnOrder: string[] = [];
  private columnWidths: Record<string, number> = {};
  private currentSort: SortState | null = null;
  private currentFilters: FilterState = {};

  constructor(private localStorageService: LocalStorageService) {}

  /**
   * Initialize table with configuration and data
   * Loads persisted state if available
   */
  initializeTable(config: TableConfig, data: any[]): void {
    this.currentConfig = config;
    this.originalData = config.treeMode ? this.structureTreeData(data) : data.map(item => ({ data: item, level: 0, expanded: false }));
    this.columnOrder = config.columns.map(col => col.key);
    
    // Load persisted state if available
    const persistedState = this.localStorageService.loadTableState(config.tableId);
    if (persistedState) {
      this.loadPersistedState(persistedState);
    }

    // Update subjects
    this.configSubject.next(config);
    this.dataSubject.next(this.originalData);
    this.applyFiltersAndSorting();
  }

  /**
   * Update table data while preserving filters and sorting
   */
  updateData(data: any[]): void {
    this.originalData = this.currentConfig?.treeMode ? this.structureTreeData(data) : data.map(item => ({ data: item, level: 0, expanded: false }));
    this.dataSubject.next(this.originalData);
    this.applyFiltersAndSorting();
  }

  /**
   * Get current table configuration
   */
  getConfig(): TableConfig | null {
    return this.currentConfig;
  }

  /**
   * Get original unfiltered data
   */
  getData(): TableRow<any>[] {
    return [...this.originalData];
  }

  /**
   * Get filtered and sorted visible data
   */
  getVisibleData(): TableRow<any>[] {
    return this.visibleDataSubject.value;
  }

  // Column Management
  /**
   * Get current column order
   */
  getColumnOrder(): string[] {
    return [...this.columnOrder];
  }

  /**
   * Reorder columns
   */
  reorderColumns(newOrder: string[]): void {
    this.columnOrder = [...newOrder];
  }

  /**
   * Get column widths
   */
  getColumnWidths(): Record<string, number> {
    return { ...this.columnWidths };
  }

  /**
   * Set width for a specific column
   */
  setColumnWidth(columnKey: string, width: number): void {
    this.columnWidths[columnKey] = width;
  }

  /**
   * Toggle column visibility
   */
  toggleColumnVisibility(columnKey: string, visible: boolean): void {
    if (!this.currentConfig) return;
    
    const column = this.currentConfig.columns.find(col => col.key === columnKey);
    if (column) {
      column.visible = visible;
    }
  }

  /**
   * Get visible columns only
   */
  getVisibleColumns(): ColumnDefinition[] {
    if (!this.currentConfig) return [];
    
    return this.currentConfig.columns.filter(col => col.visible !== false);
  }

  /**
   * Get all columns (including hidden ones)
   */
  getAllColumns(): ColumnDefinition[] {
    if (!this.currentConfig) return [];
    
    return [...this.currentConfig.columns];
  }

  // Tree-Grid Management
  /**
   * Toggles the expansion state of a row
   * @param row The row to toggle
   */
  toggleRowExpansion(row: TableRow<any>): void {
    if (row.children && row.children.length > 0) {
      row.expanded = !row.expanded;
      this.applyFiltersAndSorting();
    }
  }

  // Sorting
  /**
   * Sort by column with specific direction
   */
  sortByColumn(columnKey: string, direction: SortDirection): void {
    if (direction === 'none') {
      this.currentSort = null;
    } else {
      this.currentSort = { column: columnKey, direction };
    }
    
    this.sortStateSubject.next(this.currentSort);
    this.applyFiltersAndSorting();
  }

  /**
   * Cycle through sort directions for a column (none -> asc -> desc -> none)
   */
  cycleSortDirection(columnKey: string): void {
    const currentSort = this.currentSort;
    
    if (!currentSort || currentSort.column !== columnKey) {
      this.sortByColumn(columnKey, 'asc');
    } else if (currentSort.direction === 'asc') {
      this.sortByColumn(columnKey, 'desc');
    } else {
      this.sortByColumn(columnKey, 'none');
    }
  }

  /**
   * Get current sort state
   */
  getSortState(): SortState | null {
    return this.currentSort ? { ...this.currentSort } : null;
  }

  // Filtering
  /**
   * Set filter for a specific column
   */
  setColumnFilter(columnKey: string, filterValue: string): void {
    if (filterValue.trim()) {
      this.currentFilters[columnKey] = filterValue;
    } else {
      delete this.currentFilters[columnKey];
    }
    
    this.filterStateSubject.next({ ...this.currentFilters });
    this.applyFiltersAndSorting();
  }

  /**
   * Clear filter for a specific column
   */
  clearColumnFilter(columnKey: string): void {
    delete this.currentFilters[columnKey];
    this.filterStateSubject.next({ ...this.currentFilters });
    this.applyFiltersAndSorting();
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.currentFilters = {};
    this.filterStateSubject.next({});
    this.applyFiltersAndSorting();
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return { ...this.currentFilters };
  }

  // Private helper methods
  /**
   * Apply current filters and sorting to data
   */
  private applyFiltersAndSorting(): void {
    let result: TableRow<any>[];

    // If tree mode is enabled, flatten the data based on expansion state
    if (this.currentConfig?.treeMode) {
      // For tree mode, filtering should be more complex (e.g., keep parent if child matches)
      // For now, we'll apply a simple filter on the flattened data, which isn't ideal but will work.
      const flattened = this.flattenTreeData(this.originalData);
      result = this.applyFilters(flattened);
    } else {
      // For non-tree mode, we still use the wrapper but operate on a flat list
      result = this.applyFilters(this.originalData);
    }
    
    // Then apply sorting
    result = this.applySorting(result);

    this.visibleDataSubject.next(result);
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: TableRow<any>[]): TableRow<any>[] {
    if (Object.keys(this.currentFilters).length === 0) {
      return data;
    }

    return data.filter(row => {
      return Object.entries(this.currentFilters).every(([columnKey, filterValue]) => {
        // All data, tree or not, is wrapped in TableRow, so we access .data
        const cellValue = row.data[columnKey];
        if (cellValue == null) return false;
        
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }

  /**
   * Apply sorting to data
   */
  private applySorting(data: TableRow<any>[]): TableRow<any>[] {
    if (!this.currentSort) {
      return data;
    }

    const { column, direction } = this.currentSort;
    
    // Create a stable sort by preserving original order for equal items
    const indexedData = data.map((item, index) => ({ item, index }));

    indexedData.sort((a, b) => {
      const aValue = a.item.data[column];
      const bValue = b.item.data[column];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return a.index - b.index;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;
      
      // Compare values
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      if (comparison === 0) {
        return a.index - b.index; // Preserve original order if values are equal
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return indexedData.map(d => d.item);
  }

  /**
   * Recursively flattens the tree data to a single-level array for rendering,
   * respecting the `expanded` state of each node.
   * @param nodes The array of nodes to flatten.
   */
  private flattenTreeData(nodes: TableRow<any>[]): TableRow<any>[] {
    const flattened: TableRow<any>[] = [];

    for (const node of nodes) {
      flattened.push(node);
      if (node.expanded && node.children) {
        flattened.push(...this.flattenTreeData(node.children));
      }
    }

    return flattened;
  }

  /**
   * Structures the raw data into a tree format, setting levels and parent references.
   * @param data The raw data array.
   */
  private structureTreeData(data: any[]): TableRow<any>[] {
    const structuredData: TableRow<any>[] = [];
    const recursion = (items: any[], level: number, parent?: TableRow<any>) => {
      for (const item of items) {
        const tableRow: TableRow<any> = {
          data: item,
          level: level,
          expanded: item.expanded === true, // Default to false if not specified
          parent: parent,
          isVisible: true,
        };
        structuredData.push(tableRow);
        if (item.children && item.children.length > 0) {
          tableRow.children = [];
          recursion(item.children, level + 1, tableRow);
        }
      }
    };
    recursion(data, 0);
    
    // This is a simplified structuring. A more robust solution would map parent-child relationships.
    // For now, we assume the initial data is already nested correctly.
    // The main task is to create the TableRow objects.
    return data.map(item => this.createTableRow(item, 0));
  }

  private createTableRow(item: any, level: number, parent?: TableRow<any>): TableRow<any> {
    const row: TableRow<any> = {
      data: item,
      level,
      expanded: item.expanded || false,
      parent,
    };
    if (item.children) {
      row.children = item.children.map((child: any) => this.createTableRow(child, level + 1, row));
    }
    return row;
  }

  /**
   * Load persisted state from storage
   */
  private loadPersistedState(state: TableState): void {
    if (state.columnOrder) {
      this.columnOrder = state.columnOrder;
    }
    
    if (state.columnWidths) {
      this.columnWidths = state.columnWidths;
    }
    
    if (state.sortState) {
      this.currentSort = state.sortState;
      this.sortStateSubject.next(this.currentSort);
    }
    
    if (state.filterState) {
      this.currentFilters = state.filterState;
      this.filterStateSubject.next(this.currentFilters);
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveCurrentState(): void {
    if (!this.currentConfig) return;

    const state: TableState = {
      config: this.currentConfig,
      columnOrder: this.columnOrder,
      columnWidths: this.columnWidths,
      sortState: this.currentSort,
      filterState: this.currentFilters
    };

    this.localStorageService.saveTableState(this.currentConfig.tableId, state);
  }
} 