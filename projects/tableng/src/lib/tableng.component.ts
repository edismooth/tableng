import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableConfig } from './interfaces/table-config.interface';
import { ColumnDefinition } from './interfaces/column-definition.interface';
import { TableStateService } from './services/table-state.service';
import { LocalStorageService } from './services/local-storage.service';

/**
 * Main table component that serves as the container for the entire table functionality
 * Handles data display, user interactions, and state management
 */
@Component({
  selector: 'tng-tableng',
  template: `
    <div class="tableng-container" [ngClass]="getContainerClasses()">
      <!-- Loading State -->
      <div *ngIf="loading" class="tableng-loading">
        <div class="tableng-loading-spinner"></div>
        <span class="tableng-loading-text">Loading table data...</span>
      </div>

      <!-- Main Table Content -->
      <div class="tableng-table" [style.display]="loading ? 'none' : 'block'">
        <!-- Empty State -->
        <div *ngIf="!data || data.length === 0" class="tableng-empty">
          <div class="tableng-empty-icon">📊</div>
          <div class="tableng-empty-message">No data to display</div>
        </div>

        <!-- Table Header -->
        <div *ngIf="data && data.length > 0" 
             class="tableng-header" 
             [ngClass]="getHeaderClasses()">
          <div class="tableng-header-row">
            <div *ngFor="let column of visibleColumns" 
                 class="tableng-header-cell"
                 [ngClass]="getHeaderCellClasses(column)">
              {{ column.title }}
            </div>
          </div>
        </div>

        <!-- Table Body -->
        <div *ngIf="data && data.length > 0" 
             class="tableng-body"
             [ngClass]="getBodyClasses()">
          <div *ngFor="let row of displayData; let i = index" 
               class="tableng-body-row"
               (click)="onRowClick(row)">
            <div *ngFor="let column of visibleColumns" 
                 class="tableng-body-cell">
              {{ getCellValue(row, column) }}
            </div>
          </div>
        </div>

        <!-- Virtual Scrolling Container -->
        <div *ngIf="config?.virtualScrolling" class="tableng-virtual-scroll">
          <!-- Virtual scrolling will be implemented in later phases -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tableng-container {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .tableng-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #666;
    }

    .tableng-loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .tableng-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #999;
    }

    .tableng-empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .tableng-table {
      width: 100%;
      height: 100%;
    }

    .tableng-header {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    .tableng-sticky-header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .tableng-header-row,
    .tableng-body-row {
      display: flex;
      width: 100%;
    }

    .tableng-header-cell,
    .tableng-body-cell {
      flex: 1;
      padding: 12px;
      border-right: 1px solid #dee2e6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tableng-header-cell {
      font-weight: 600;
      color: #495057;
    }

    .tableng-body-row {
      border-bottom: 1px solid #dee2e6;
    }

    .tableng-body-row:hover {
      background-color: #f8f9fa;
    }

    .tableng-body-row:nth-child(even) {
      background-color: #ffffff;
    }

    .tableng-body-row:nth-child(odd) {
      background-color: #f9f9f9;
    }
  `]
})
export class TablengComponent implements OnInit, OnDestroy, OnChanges {
  // Input Properties
  @Input() config?: TableConfig;
  @Input() data?: any[];
  @Input() loading: boolean = false;

  // Output Events
  @Output() rowClick = new EventEmitter<any>();
  @Output() cellEdit = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() columnReorder = new EventEmitter<any>();
  @Output() columnResize = new EventEmitter<any>();

  // Component Properties
  tableId?: string;
  visibleColumns: ColumnDefinition[] = [];
  displayData: any[] = [];
  subscriptions: Subscription[] = [];
  hasStickyColumns: boolean = false;

  constructor(
    private tableStateService: TableStateService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.tableId = this.config.tableId;
      this.hasStickyColumns = !!(this.config.stickyColumns?.left || this.config.stickyColumns?.right);
      this.tableStateService.initialize(this.config);
      this.updateVisibleColumns();
    }

    if (changes['data'] && this.data) {
      this.tableStateService.setData(this.data);
      this.updateDisplayData();
    }
  }

  // Event Handlers
  onRowClick(rowData: any): void {
    this.rowClick.emit(rowData);
  }

  onCellEdit(editData: any): void {
    this.cellEdit.emit(editData);
  }

  onSortChange(sortData: any): void {
    this.sortChange.emit(sortData);
  }

  onFilterChange(filterData: any): void {
    this.filterChange.emit(filterData);
  }

  // Helper Methods
  getContainerClasses(): string[] {
    const classes = ['tableng-container'];
    if (this.tableId) {
      classes.push(`tableng-${this.tableId}`);
    }
    return classes;
  }

  getHeaderClasses(): string[] {
    const classes = ['tableng-header'];
    if (this.config?.stickyHeaders) {
      classes.push('tableng-sticky-header');
    }
    return classes;
  }

  getHeaderCellClasses(column: ColumnDefinition): string[] {
    const classes = ['tableng-header-cell'];
    if (column.cssClass) {
      classes.push(column.cssClass);
    }
    if (column.headerCssClass) {
      classes.push(column.headerCssClass);
    }
    return classes;
  }

  getBodyClasses(): string[] {
    const classes = ['tableng-body'];
    if (this.config?.virtualScrolling) {
      classes.push('tableng-virtual-scroll');
    }
    return classes;
  }

  getCellValue(row: any, column: ColumnDefinition): any {
    const value = row[column.key];
    
    // Apply custom formatter if available
    if (column.formatter && typeof column.formatter === 'function') {
      return column.formatter(value, row, column);
    }
    
    // Default formatting based on column type
    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return value || '';
    }
  }

  private initializeSubscriptions(): void {
    // Subscribe to data changes
    if (this.tableStateService.data$) {
      const dataSub = this.tableStateService.data$.subscribe(data => {
        this.displayData = data || [];
      });
      this.subscriptions.push(dataSub);
    }

    // Subscribe to column changes
    if (this.tableStateService.columns$) {
      const columnsSub = this.tableStateService.columns$.subscribe(columns => {
        this.updateVisibleColumns();
      });
      this.subscriptions.push(columnsSub);
    }
  }

  private updateVisibleColumns(): void {
    if (this.config?.columns) {
      this.visibleColumns = this.config.columns.filter(column => column.visible !== false);
    }
  }

  private updateDisplayData(): void {
    this.displayData = this.data || [];
  }
}
