import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig } from '../interfaces/table-config.interface';
import { ColumnDefinition, SortDirection } from '../interfaces/column-definition.interface';
import { LocalStorageService, TableState } from './local-storage.service';

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
export interface FilterState {
  [columnKey: string]: string;
}

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
  private readonly dataSubject = new BehaviorSubject<any[]>([]);
  private readonly visibleDataSubject = new BehaviorSubject<any[]>([]);
  private readonly sortStateSubject = new BehaviorSubject<SortState | null>(null);
  private readonly filterStateSubject = new BehaviorSubject<FilterState>({});

  // Observable streams
  readonly config$ = this.configSubject.asObservable();
  readonly data$ = this.dataSubject.asObservable();
  readonly visibleData$ = this.visibleDataSubject.asObservable();
  readonly sortState$ = this.sortStateSubject.asObservable();
  readonly filterState$ = this.filterStateSubject.asObservable();

  // Internal state
  private originalData: any[] = [];
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
    this.originalData = [...data];
    this.columnOrder = config.columns.map(col => col.key);
    
    // Load persisted state if available
    const persistedState = this.localStorageService.loadTableState(config.tableId);
    if (persistedState) {
      this.loadPersistedState(persistedState);
    }

    // Update subjects
    this.configSubject.next(config);
    this.dataSubject.next(data);
    this.applyFiltersAndSorting();
  }

  /**
   * Update table data while preserving filters and sorting
   */
  updateData(data: any[]): void {
    this.originalData = [...data];
    this.dataSubject.next(data);
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
  getData(): any[] {
    return [...this.originalData];
  }

  /**
   * Get filtered and sorted visible data
   */
  getVisibleData(): any[] {
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
    this.saveCurrentState();
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
    this.saveCurrentState();
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
    this.saveCurrentState();
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
    this.saveCurrentState();
  }

  /**
   * Clear filter for a specific column
   */
  clearColumnFilter(columnKey: string): void {
    delete this.currentFilters[columnKey];
    this.filterStateSubject.next({ ...this.currentFilters });
    this.applyFiltersAndSorting();
    this.saveCurrentState();
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this.currentFilters = {};
    this.filterStateSubject.next({});
    this.applyFiltersAndSorting();
    this.saveCurrentState();
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
    let result = [...this.originalData];

    // Apply filters first
    result = this.applyFilters(result);

    // Then apply sorting
    result = this.applySorting(result);

    this.visibleDataSubject.next(result);
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: any[]): any[] {
    if (Object.keys(this.currentFilters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(this.currentFilters).every(([columnKey, filterValue]) => {
        const cellValue = item[columnKey];
        if (cellValue == null) return false;
        
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }

  /**
   * Apply sorting to data
   */
  private applySorting(data: any[]): any[] {
    if (!this.currentSort) {
      return data;
    }

    const { column, direction } = this.currentSort;
    
    return [...data].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;
      
      // Compare values
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
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

    const state: Partial<TableState> = {
      config: this.currentConfig,
      columnOrder: this.columnOrder,
      columnWidths: this.columnWidths,
      sortState: this.currentSort,
      filterState: this.currentFilters
    };

    this.localStorageService.saveTableState(this.currentConfig.tableId, state);
  }
} 