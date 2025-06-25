import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { TableConfig } from '../interfaces/table-config.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';
import { TableRow } from '../interfaces/table-row.interface';

/**
 * Interface for virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  enabled: boolean;
  itemHeight: number;
  viewportHeight: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Interface for cell edit events
 */
export interface CellEditEvent {
  rowIndex: number;
  column: string;
  value: unknown;
  rowData: unknown;
}

/**
 * Interface for cell change events
 */
export interface CellChangeEvent {
  rowIndex: number;
  column: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Table body component that handles data rendering, row interactions, and virtual scrolling
 * Manages the main data display and user interactions with rows and cells
 */
@Component({
  selector: 'tng-table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.scss']
})
export class TableBodyComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: TableRow<any>[] = [];
  @Input() config?: TableConfig | null;
  @Input() editConfigs?: Record<string, CellEditConfig>;
  @Input() loading = false;
  @Input() selectedRows: Set<unknown> | unknown[] = [];
  @Input() emptyMessage?: string;
  @Input() virtualScrollConfig?: VirtualScrollConfig;

  @Output() rowClick = new EventEmitter<unknown>();
  @Output() rowSelect = new EventEmitter<{ row: unknown; selected: boolean; index: number }>();
  @Output() cellEdit = new EventEmitter<CellEditEvent>();
  @Output() cellChange = new EventEmitter<CellChangeEvent>();
  @Output() toggleRowExpansion = new EventEmitter<TableRow<any>>();

  // Event Handlers
  onRowClick(rowData: unknown, index: number): void {
    this.rowClick.emit(rowData);
  }

  onToggleExpand(event: { rowData: TableRow<any> }): void {
    this.toggleRowExpansion.emit(event.rowData);
  }

  onRowKeyDown(event: KeyboardEvent, rowData: unknown, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowClick.emit(rowData);
    }
  }

  onRowSelect(eventData: { rowIndex: number; rowData: TableRow<any>; selected: boolean }, rowData: TableRow<any>, index: number): void {
    this.rowSelect.emit({
      row: eventData.rowData,
      selected: eventData.selected,
      index: eventData.rowIndex
    });
  }

  onRowSelectVirtual(event: Event, rowData: TableRow<any>, index: number): void {
    const target = event.target as HTMLInputElement;
    const selected = target.checked;

    this.rowSelect.emit({
      row: rowData,
      selected: selected,
      index: index
    });
  }

  onRowMouseEnter(event: Event | null): void {
    if (!event?.target) return;
    const target = event.target as HTMLElement;
    target.classList.add('tableng-row-hover');
  }

  onRowMouseLeave(event: Event | null): void {
    if (!event?.target) return;
    const target = event.target as HTMLElement;
    target.classList.remove('tableng-row-hover');
  }

  onCellClick(event: Event, column: ColumnDefinition, rowData: unknown, rowIndex: number): void {
    // Basic cell click handling
    event.stopPropagation();
  }

  onCellDoubleClick(column: ColumnDefinition, rowData: unknown, rowIndex: number): void {
    if (column.editable && this.config?.editable) {
      this.cellEdit.emit({
        rowIndex: rowIndex,
        column: column.key,
        value: this.getCellValue(rowData, column),
        rowData: rowData
      });
    }
  }

  onCellChange(changeData: CellChangeEvent): void {
    this.cellChange.emit(changeData);
  }

  onScroll(event: Event): void {
    if (!this.config?.virtualScrolling || !this.virtualScrollConfig) {
      return;
    }

    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const itemHeight = this.virtualScrollConfig.itemHeight;
    const viewportHeight = this.virtualScrollConfig.viewportHeight;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2; // Buffer items
    const endIndex = Math.min(startIndex + visibleCount, this.data.length - 1);

    this.virtualScrollConfig = {
      ...this.virtualScrollConfig,
      startIndex: startIndex,
      endIndex: endIndex
    };
  }

  // Helper Methods
  getBodyClasses(): string[] {
    const classes = ['tableng-body'];
    
    if (this.config?.virtualScrolling) {
      classes.push('tableng-virtual-scrolling');
    }

    return classes;
  }

  getRowClasses(rowData: unknown, index: number): string[] {
    const classes = ['tableng-row'];
    
    if (this.isRowSelected(rowData)) {
      classes.push('tableng-row-selected');
    }

    return classes;
  }

  getCellClasses(column: ColumnDefinition, rowData: unknown): string[] {
    const classes = ['tableng-cell'];
    
    // Add type-specific classes
    classes.push(`tableng-cell-type-${column.type}`);
    
    if (column.cssClass) {
      classes.push(column.cssClass);
    }

    if (column.cellCssClass) {
      classes.push(column.cellCssClass);
    }

    if (column.editable && this.config?.editable) {
      classes.push('tableng-cell-editable');
    }

    return classes;
  }

  isRowSelected(rowData: unknown): boolean {
    if (this.selectedRows instanceof Set) {
      return this.selectedRows.has(rowData);
    }
    return Array.isArray(this.selectedRows) && this.selectedRows.includes(rowData);
  }

  getCellValue(rowData: unknown, column: ColumnDefinition): unknown {
    if (!rowData || typeof rowData !== 'object') {
      return '';
    }

    const obj = rowData as Record<string, unknown>;
    return obj[column.key];
  }

  formatCellValue(rowData: unknown, column: ColumnDefinition): string {
    const value = this.getCellValue(rowData, column);

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }

    // Use custom formatter if provided
    if (column.formatter) {
      return column.formatter(value);
    }

    // Default formatting by type
    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        } else if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
        }
        return String(value);
      
      case 'number':
        return typeof value === 'number' ? value.toString() : String(value);
      
      default:
        return String(value);
    }
  }

  trackByFn = (index: number, item: TableRow<any>): unknown => {
    // In tree mode, rows can shift, so we need a stable identifier.
    // Try to get a unique identifier from the data, fallback to index
    if (item && item.data && typeof item.data === 'object') {
      const data = item.data as any;
      return data.id ?? data._id ?? index;
    }
    return index;
  }

  // Virtual Scrolling Methods
  getVisibleData(): TableRow<any>[] {
    if (!this.config?.virtualScrolling || !this.virtualScrollConfig) {
      return this.data;
    }

    const start = this.virtualScrollConfig.startIndex;
    const end = Math.min(this.virtualScrollConfig.endIndex + 1, this.data.length);
    
    return this.data.slice(start, end);
  }

  getActualRowIndex(visibleIndex: number): number {
    if (!this.config?.virtualScrolling || !this.virtualScrollConfig) {
      return visibleIndex;
    }

    return this.virtualScrollConfig.startIndex + visibleIndex;
  }

  getVirtualScrollHeight(): number {
    if (!this.virtualScrollConfig) {
      return 0;
    }

    return this.data.length * this.virtualScrollConfig.itemHeight;
  }

  getTopSpacerHeight(): number {
    if (!this.virtualScrollConfig) {
      return 0;
    }

    return this.virtualScrollConfig.startIndex * this.virtualScrollConfig.itemHeight;
  }

  getBottomSpacerHeight(): number {
    if (!this.virtualScrollConfig) {
      return 0;
    }

    const remainingItems = this.data.length - (this.virtualScrollConfig.endIndex + 1);
    return Math.max(0, remainingItems * this.virtualScrollConfig.itemHeight);
  }
} 