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
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss']
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