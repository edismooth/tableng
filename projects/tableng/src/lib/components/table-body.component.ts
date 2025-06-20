import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { TableConfig } from '../interfaces/table-config.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

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
  template: `
    <div class="tableng-body" 
         [ngClass]="getBodyClasses()"
         [attr.role]="'rowgroup'"
         (scroll)="onScroll($event)">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="tableng-loading">
        <div class="tableng-loading-content">
          <div class="tableng-loading-spinner"></div>
          <span class="tableng-loading-text">Loading...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && (!data || data.length === 0)" class="tableng-empty">
        <div class="tableng-empty-content">
          <div class="tableng-empty-icon">📄</div>
          <div class="tableng-empty-message">{{ emptyMessage || 'No data available' }}</div>
        </div>
      </div>

      <!-- Virtual Scroll Container -->
      <div *ngIf="!loading && data && data.length > 0 && config?.virtualScrolling" 
           class="tableng-virtual-scroll-container"
           [style.height.px]="getVirtualScrollHeight()">
        
        <!-- Spacer for scroll positioning -->
        <div class="tableng-virtual-spacer-top" 
             [style.height.px]="getTopSpacerHeight()"></div>

        <!-- Visible Rows -->
        <div *ngFor="let item of getVisibleData(); let i = index; trackBy: trackByFn" 
             class="tableng-row"
             [ngClass]="getRowClasses(item, getActualRowIndex(i))"
             [attr.role]="'row'"
             [attr.tabindex]="'0'"
             (click)="onRowClick(item, getActualRowIndex(i))"
             (keydown)="onRowKeyDown($event, item, getActualRowIndex(i))"
             (mouseenter)="onRowMouseEnter($event)"
             (mouseleave)="onRowMouseLeave($event)">
          
          <!-- Selection Checkbox -->
          <div *ngIf="config?.selectable" class="tableng-cell tableng-selection-cell">
            <input type="checkbox" 
                   class="tableng-selection-checkbox"
                   [checked]="isRowSelected(item)"
                   (change)="onRowSelect($event, item, getActualRowIndex(i))"
                   (click)="$event.stopPropagation()">
          </div>

          <!-- Data Cells -->
          <div *ngFor="let column of columns" 
               class="tableng-cell"
               [ngClass]="getCellClasses(column, item)"
               [style.width.px]="column.width"
               [attr.role]="'gridcell'"
               (dblclick)="onCellDoubleClick(column, item, getActualRowIndex(i))"
               (click)="onCellClick($event, column, item, getActualRowIndex(i))">
            
            <span class="tableng-cell-content">
              {{ formatCellValue(item, column) }}
            </span>
          </div>
        </div>

        <!-- Spacer for scroll positioning -->
        <div class="tableng-virtual-spacer-bottom" 
             [style.height.px]="getBottomSpacerHeight()"></div>
      </div>

      <!-- Regular (Non-Virtual) Rendering -->
      <div *ngIf="!loading && data && data.length > 0 && !config?.virtualScrolling" 
           class="tableng-regular-container">
        
        <div *ngFor="let item of data; let i = index; trackBy: trackByFn" 
             class="tableng-row"
             [ngClass]="getRowClasses(item, i)"
             [attr.role]="'row'"
             [attr.tabindex]="'0'"
             (click)="onRowClick(item, i)"
             (keydown)="onRowKeyDown($event, item, i)"
             (mouseenter)="onRowMouseEnter($event)"
             (mouseleave)="onRowMouseLeave($event)">
          
          <!-- Selection Checkbox -->
          <div *ngIf="config?.selectable" class="tableng-cell tableng-selection-cell">
            <input type="checkbox" 
                   class="tableng-selection-checkbox"
                   [checked]="isRowSelected(item)"
                   (change)="onRowSelect($event, item, i)"
                   (click)="$event.stopPropagation()">
          </div>

          <!-- Data Cells -->
          <div *ngFor="let column of columns" 
               class="tableng-cell"
               [ngClass]="getCellClasses(column, item)"
               [style.width.px]="column.width"
               [attr.role]="'gridcell'"
               (dblclick)="onCellDoubleClick(column, item, i)"
               (click)="onCellClick($event, column, item, i)">
            
            <span class="tableng-cell-content">
              {{ formatCellValue(item, column) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tableng-body {
      overflow-x: auto;
      overflow-y: auto;
      flex: 1;
      background: #ffffff;
    }

    .tableng-virtual-scroll-container {
      position: relative;
      overflow: hidden;
    }

    .tableng-regular-container {
      width: 100%;
    }

    .tableng-row {
      display: flex;
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.2s ease;
      cursor: pointer;
      outline: none;
    }

    .tableng-row:hover,
    .tableng-row-hover {
      background-color: #f8f9fa;
    }

    .tableng-row-selected {
      background-color: #e3f2fd !important;
    }

    .tableng-row:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .tableng-row:focus:not(:focus-visible) {
      outline: none;
    }

    .tableng-cell {
      padding: 12px;
      border-right: 1px solid #e9ecef;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      position: relative;
    }

    .tableng-cell-content {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tableng-cell-editable {
      cursor: pointer;
    }

    .tableng-cell-editable:hover {
      background-color: #f1f3f4;
    }

    .tableng-selection-cell {
      width: 40px;
      min-width: 40px;
      justify-content: center;
      padding: 8px;
    }

    .tableng-selection-checkbox {
      cursor: pointer;
    }

    /* Loading State */
    .tableng-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 40px;
    }

    .tableng-loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #6c757d;
    }

    .tableng-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e9ecef;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: tableng-spin 1s linear infinite;
    }

    .tableng-loading-text {
      font-size: 14px;
      font-weight: 500;
    }

    @keyframes tableng-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty State */
    .tableng-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 40px;
    }

    .tableng-empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #6c757d;
      text-align: center;
    }

    .tableng-empty-icon {
      font-size: 48px;
      opacity: 0.5;
    }

    .tableng-empty-message {
      font-size: 16px;
      font-weight: 500;
    }

    /* Virtual Scrolling */
    .tableng-virtual-spacer-top,
    .tableng-virtual-spacer-bottom {
      width: 100%;
      pointer-events: none;
    }

    /* Data Type Specific Styling */
    .tableng-cell-type-number {
      text-align: right;
      font-family: 'Courier New', monospace;
    }

    .tableng-cell-type-boolean {
      text-align: center;
    }

    .tableng-cell-type-date {
      font-family: 'Courier New', monospace;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .tableng-cell {
        padding: 8px;
        font-size: 14px;
      }
      
      .tableng-selection-cell {
        width: 32px;
        min-width: 32px;
        padding: 4px;
      }
    }
  `]
})
export class TableBodyComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: unknown[] = [];
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

  // Event Handlers
  onRowClick(rowData: unknown, index: number): void {
    this.rowClick.emit(rowData);
  }

  onRowKeyDown(event: KeyboardEvent, rowData: unknown, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowClick.emit(rowData);
    }
  }

  onRowSelect(event: Event, rowData: unknown, index: number): void {
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

  trackByFn(index: number, item: unknown): unknown {
    return item;
  }

  // Virtual Scrolling Methods
  getVisibleData(): unknown[] {
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