import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ColumnDefinition, SortDirection } from '../interfaces/column-definition.interface';
import { TableConfig } from '../interfaces/table-config.interface';
import { SortState, FilterState } from '../services/table-state.service';

/**
 * Table header component that handles column headers, sorting, filtering, and resizing
 * Manages all header-related interactions and events
 */
@Component({
  selector: 'tng-table-header',
  template: `
    <div class="tableng-header" [ngClass]="getHeaderClasses()">
      <div class="tableng-header-row">
        <div *ngFor="let column of columns; let i = index" 
             class="tableng-header-cell"
             [ngClass]="getHeaderCellClasses(column)"
             [style.width.px]="column.width"
             [draggable]="config?.reorderable"
             (click)="onColumnClick(column)"
             (keydown)="onKeyDown($event, column)"
             (dragstart)="onDragStart($event, i)"
             (dragend)="onDragEnd($event)"
             [attr.role]="column.sortable ? 'columnheader' : null"
             [attr.aria-sort]="getAriaSort(column)"
             [attr.tabindex]="column.sortable ? '0' : null">
          
          <!-- Column Title and Sort Icon -->
          <div class="tableng-header-content">
            <span class="tableng-header-cell-title">{{ column.title }}</span>
            
            <!-- Sort Icon -->
            <span *ngIf="column.sortable && config?.sorting" 
                  class="tableng-sort-icon"
                  [ngClass]="getSortIconClasses(column)">
              {{ getSortIcon(column) }}
            </span>
          </div>

          <!-- Filter Input -->
          <div *ngIf="column.filterable && config?.filtering" 
               class="tableng-filter-container">
            <input type="text" 
                   class="tableng-filter-input"
                   [placeholder]="'Filter ' + column.title"
                   [value]="getFilterValue(column.key)"
                   [attr.aria-label]="'Filter by ' + column.title"
                   (input)="onFilterChange($event, column)"
                   (click)="$event.stopPropagation()">
          </div>

          <!-- Resize Handle -->
          <div *ngIf="column.resizable && config?.resizable" 
               class="tableng-resize-handle"
               (mousedown)="onResizeStart($event, column)">
            <span class="tableng-resize-line"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tableng-header {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      user-select: none;
    }

    .tableng-sticky-header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .tableng-header-row {
      display: flex;
      width: 100%;
    }

    .tableng-header-cell {
      position: relative;
      padding: 12px;
      border-right: 1px solid #dee2e6;
      overflow: hidden;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .tableng-header-cell:hover {
      background-color: #e9ecef;
    }

    .tableng-header-cell.tableng-sortable {
      cursor: pointer;
    }

    .tableng-header-cell.tableng-dragging {
      opacity: 0.5;
      background-color: #cce5ff;
    }

    .tableng-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      pointer-events: none;
    }

    .tableng-header-cell-title {
      font-weight: 600;
      color: #495057;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tableng-sort-icon {
      margin-left: 8px;
      font-size: 12px;
      color: #6c757d;
      min-width: 12px;
      text-align: center;
    }

    .tableng-sorted-asc .tableng-sort-icon {
      color: #007bff;
    }

    .tableng-sorted-desc .tableng-sort-icon {
      color: #007bff;
    }

    .tableng-filter-container {
      margin-top: 8px;
      pointer-events: auto;
    }

    .tableng-filter-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    }

    .tableng-filter-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .tableng-resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 100%;
      cursor: col-resize;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tableng-resize-handle:hover .tableng-resize-line {
      background-color: #007bff;
    }

    .tableng-resize-line {
      width: 2px;
      height: 60%;
      background-color: #dee2e6;
      transition: background-color 0.2s;
    }

    /* Accessibility focus styles */
    .tableng-header-cell:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .tableng-header-cell:focus:not(:focus-visible) {
      outline: none;
    }
  `]
})
export class TableHeaderComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() config?: TableConfig | null;
  @Input() sortState?: SortState;
  @Input() filterState?: FilterState;
  @Input() stickyHeader = false;

  @Output() sortChange = new EventEmitter<{ column: string; direction: SortDirection }>();
  @Output() filterChange = new EventEmitter<{ column: string; value: string }>();
  @Output() columnResize = new EventEmitter<{ column: string; width: number }>();
  @Output() columnReorder = new EventEmitter<{ fromIndex: number; toIndex: number }>();

  private currentSortColumn?: string;
  private currentSortDirection: SortDirection = 'none';
  private draggedIndex?: number;

  // Event Handlers
  onColumnClick(column: ColumnDefinition): void {
    if (column.sortable && this.config?.sorting) {
      this.onColumnSort(column.key);
    }
  }

  onColumnSort(columnKey: string): void {
    let newDirection: SortDirection;

    if (this.currentSortColumn === columnKey) {
      // Cycle through directions: none -> asc -> desc -> none
      switch (this.currentSortDirection) {
        case 'none':
          newDirection = 'asc';
          break;
        case 'asc':
          newDirection = 'desc';
          break;
        case 'desc':
          newDirection = 'none';
          break;
        default:
          newDirection = 'asc';
      }
    } else {
      newDirection = 'asc';
    }

    this.currentSortColumn = columnKey;
    this.currentSortDirection = newDirection;

    this.sortChange.emit({
      column: columnKey,
      direction: newDirection
    });
  }

  onKeyDown(event: KeyboardEvent, column: ColumnDefinition): void {
    if ((event.key === 'Enter' || event.key === ' ') && column.sortable && this.config?.sorting) {
      event.preventDefault();
      this.onColumnSort(column.key);
    }
  }

  onFilterChange(event: Event, column: ColumnDefinition): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.filterChange.emit({
      column: column.key,
      value: value
    });
  }

  onResizeStart(event: MouseEvent, column: ColumnDefinition): void {
    event.stopPropagation();
    // Basic resize logic - will be enhanced in later phases
    const startX = event.clientX;
    const startWidth = column.width || 100;

    const onMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      
      this.columnResize.emit({
        column: column.key,
        width: newWidth
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onColumnResize(resizeData: { column: string; width: number }): void {
    this.columnResize.emit(resizeData);
  }

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    const target = event.target as HTMLElement;
    target.classList.add('tableng-dragging');
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('tableng-dragging');
    this.draggedIndex = undefined;
  }

  onColumnReorder(reorderData: { fromIndex: number; toIndex: number }): void {
    this.columnReorder.emit(reorderData);
  }

  // Helper Methods
  getHeaderClasses(): string[] {
    const classes = ['tableng-header'];
    if (this.stickyHeader) {
      classes.push('tableng-sticky-header');
    }
    return classes;
  }

  getHeaderCellClasses(column: ColumnDefinition): string[] {
    const classes = ['tableng-header-cell'];
    
    if (column.sortable && this.config?.sorting) {
      classes.push('tableng-sortable');
    }

    if (column.cssClass) {
      classes.push(column.cssClass);
    }

    if (column.headerCssClass) {
      classes.push(column.headerCssClass);
    }

    // Add sort state classes
    if (this.sortState?.column === column.key) {
      classes.push(`tableng-sorted-${this.sortState.direction}`);
    }

    return classes;
  }

  getSortIconClasses(column: ColumnDefinition): string[] {
    const classes = ['tableng-sort-icon'];
    
    if (this.sortState?.column === column.key) {
      classes.push(`tableng-sort-${this.sortState.direction}`);
    }

    return classes;
  }

  getSortIcon(column: ColumnDefinition): string {
    if (this.sortState?.column === column.key) {
      switch (this.sortState.direction) {
        case 'asc':
          return '▲';
        case 'desc':
          return '▼';
        default:
          return '▲▼';
      }
    }
    return '▲▼';
  }

  getAriaSort(column: ColumnDefinition): string | null {
    if (!column.sortable || !this.config?.sorting) {
      return null;
    }

    if (this.sortState?.column === column.key) {
      return this.sortState.direction === 'asc' ? 'ascending' : 'descending';
    }

    return 'none';
  }

  /**
   * Get current filter value for a column
   */
  getFilterValue(columnKey: string): string {
    return this.filterState?.[columnKey] || '';
  }
} 