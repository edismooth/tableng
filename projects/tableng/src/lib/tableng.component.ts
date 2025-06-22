import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { TableConfig } from './interfaces/table-config.interface';
import { ColumnDefinition } from './interfaces/column-definition.interface';
import { CellEditConfig } from './interfaces/cell-edit-config.interface';
import { TableStateService, SortState, FilterState } from './services/table-state.service';
import { LocalStorageService, TableState } from './services/local-storage.service';

@Component({
  selector: 'tng-tableng',
  template: `
    <div class="tableng-container" 
         [class.tableng-virtual-scroll]="config?.virtualScrolling"
         [class.tableng-theme-dark]="getThemeName() === 'dark'"
         [class.tableng-theme-light]="getThemeName() === 'light'"
         [class.tableng-loading]="loading">
      
      <table class="tableng-table"
             role="table"
             tabindex="0"
             [attr.aria-label]="config?.tableId || 'Data table'"
             [class.tableng-sticky-header]="config?.stickyHeaders">
        
        <thead>
          <tng-table-header
            [columns]="visibleColumns"
            [config]="config"
            [sortState]="currentSortState"
            [filterState]="currentFilterState"
            (sortChange)="onSortChange($event)"
            (filterChange)="onFilterChange($event)"
            (columnResize)="onColumnResize($event)"
            (columnReorder)="onColumnReorder($event)">
          </tng-table-header>
        </thead>
        
        <tbody>
          <tng-table-body
            [data]="filteredData"
            [columns]="visibleColumns"
            [config]="config"
            [editConfigs]="editConfigs"
            [selectedRows]="selectedRowsSet"
            (rowClick)="onRowClick($event)"
            (rowSelect)="onRowSelect($event)"
            (cellChange)="onCellChange($event)">
          </tng-table-body>
        </tbody>
      </table>
      
      <!-- Screen reader announcements -->
      <div class="tableng-sr-announcer" aria-live="polite" aria-atomic="true">
        {{ announcement }}
      </div>
    </div>
  `,
  styles: [`
    .tableng-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: var(--tableng-bg, white);
      border: 1px solid var(--tableng-border, #e0e0e0);
      border-radius: 4px;
    }

    .tableng-table {
      width: 100%;
      border-collapse: collapse;
      background-color: inherit;
    }

    .tableng-table:focus {
      outline: 2px solid var(--tableng-primary, #007bff);
      outline-offset: -2px;
    }

    .tableng-sticky-header thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: inherit;
    }

    .tableng-virtual-scroll {
      overflow-y: auto;
      height: 100%;
    }

    /* Theme: Dark */
    .tableng-theme-dark {
      --tableng-bg: #1a1a1a;
      --tableng-surface: #2a2a2a;
      --tableng-text: #ffffff;
      --tableng-text-secondary: #cccccc;
      --tableng-border: #404040;
      --tableng-hover: #3a3a3a;
      --tableng-selected: #4a4a4a;
      --tableng-primary: #007bff;
      color: var(--tableng-text);
    }

    /* Theme: Light (default) */
    .tableng-theme-light {
      --tableng-bg: #ffffff;
      --tableng-surface: #f8f9fa;
      --tableng-text: #212529;
      --tableng-text-secondary: #6c757d;
      --tableng-border: #dee2e6;
      --tableng-hover: #e9ecef;
      --tableng-selected: #e7f3ff;
      --tableng-primary: #007bff;
    }

    .tableng-sr-announcer {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablengComponent implements OnInit, OnDestroy, OnChanges {
  @Input() config?: TableConfig;
  @Input() data?: any[];
  @Input() editConfigs?: Record<string, CellEditConfig>;
  @Input() loading?: boolean;

  @Output() rowClick = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() cellEdit = new EventEmitter<any>();
  @Output() dataChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() columnResize = new EventEmitter<any>();
  @Output() columnReorder = new EventEmitter<any>();

  // Internal state
  visibleColumns: ColumnDefinition[] = [];
  filteredData: any[] = [];
  selectedRows: any[] = [];
  selectedRowsSet = new Set<any>();

  currentFilterState: FilterState = {};
  announcement = '';

  private destroy$ = new Subject<void>();
  private saveState$ = new Subject<void>();

  constructor(
    private stateService: TableStateService,
    private storageService: LocalStorageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.config) return;

    // Initialize state service
    this.stateService.initializeTable(this.config, this.data || []);

    // Load saved state if available
    const savedState = this.storageService.loadTableState(this.config.tableId);
    if (savedState) {
      this.restoreState(savedState);
    }

    // Subscribe to state changes
    this.subscribeToStateChanges();

    // Setup auto-save with debounce
    this.saveState$
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.saveCurrentState());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.stateService.updateData(this.data || []);
    }

    if (changes['config'] && !changes['config'].firstChange && this.config) {
      this.updateConfig(this.config);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Public API Methods
  clearFilters(): void {
    this.stateService.clearAllFilters();
    this.announce('All filters cleared');
  }

  selectAll(): void {
    this.selectedRows = [...this.filteredData];
    this.selectedRowsSet = new Set(this.selectedRows);
    this.cd.markForCheck();
    this.announce(`All ${this.selectedRows.length} rows selected`);
  }

  deselectAll(): void {
    this.selectedRows = [];
    this.selectedRowsSet.clear();
    this.cd.markForCheck();
    this.announce('All rows deselected');
  }

  refresh(): void {
    if (this.data) {
      this.stateService.updateData(this.data);
      this.announce('Table data refreshed');
    }
  }

  resetState(): void {
    if (!this.config) return;
    
    // Reset service state
    this.stateService.initializeTable(this.config, this.data || []);
    
    // Clear stored state
    this.storageService.removeTableState(this.config.tableId);
    
    // Reset local state
    this.selectedRows = [];
    this.selectedRowsSet.clear();
    
    this.cd.markForCheck();
    this.announce('Table state reset to defaults');
  }

  exportToCSV(): string {
    const headers = this.visibleColumns.map(col => col.title).join(',');
    const rows = this.filteredData.map(row => 
      this.visibleColumns.map(col => {
        const value = row[col.key];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  }

  // Event Handlers
  onSortChange(event: any): void {
    this.stateService.sortByColumn(event.column, event.direction);
    this.sortChange.emit(event);
    this.saveState$.next();
    this.announce(`Sorted by ${event.column} ${event.direction}`);
  }

  onFilterChange(event: any): void {
    this.stateService.setColumnFilter(event.column, event.value);
    this.filterChange.emit(event);
    this.saveState$.next();
    this.announce(`Filter applied to ${event.column}`);
  }

  onColumnResize(event: any): void {
    this.stateService.setColumnWidth(event.column, event.width);
    this.columnResize.emit(event);
    this.saveState$.next();
  }

  onColumnReorder(event: any): void {
    const currentOrder = this.stateService.getColumnOrder();
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(event.from, 1);
    newOrder.splice(event.to, 0, removed);
    
    this.stateService.reorderColumns(newOrder);
    this.columnReorder.emit(event);
    this.saveState$.next();
    this.announce('Columns reordered');
  }

  onRowClick(event: any): void {
    this.rowClick.emit(event);
  }

  onRowSelect(event: any): void {
    if (event.selected) {
      this.selectedRows.push(event.rowData);
      this.selectedRowsSet.add(event.rowData);
    } else {
      const index = this.selectedRows.indexOf(event.rowData);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
        this.selectedRowsSet.delete(event.rowData);
      }
    }
    
    this.rowSelect.emit(event);
    this.cd.markForCheck();
    this.announce(`Row ${event.selected ? 'selected' : 'deselected'}`);
  }

  onCellChange(event: any): void {
    // Update data
    if (this.data && event.rowIndex >= 0 && event.rowIndex < this.data.length) {
      this.data[event.rowIndex][event.column] = event.newValue;
    }
    
    this.cellEdit.emit(event);
    this.dataChange.emit({
      data: this.data,
      change: event
    });
    
    this.announce(`Cell updated in ${event.column}`);
  }

  // Private Methods
  private subscribeToStateChanges(): void {
    // Subscribe to visible data changes
    this.stateService.visibleData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.filteredData = data;
        this.cd.markForCheck();
      });

    // Subscribe to sort state changes
    this.stateService.sortState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        // Sort state is now handled by the getter
        this.cd.markForCheck();
      });

    // Subscribe to filter state changes
    this.stateService.filterState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentFilterState = state;
        this.cd.markForCheck();
      });

    // Update visible columns
    this.updateVisibleColumns();
  }

  private updateVisibleColumns(): void {
    if (!this.config) return;
    
    const columnOrder = this.stateService.getColumnOrder();
    const columnWidths = this.stateService.getColumnWidths();
    
    // Reorder and update column widths
    this.visibleColumns = columnOrder
      .map(key => this.config!.columns.find(col => col.key === key))
      .filter((col): col is ColumnDefinition => col !== undefined && col.visible !== false)
      .map(col => ({
        ...col,
        width: columnWidths[col.key] || col.width
      }));
  }

  private restoreState(state: TableState): void {
    // State restoration is handled by the state service
    // Just update our local view
    this.updateVisibleColumns();
  }

  private saveCurrentState(): void {
    if (!this.config) return;
    
    const state: Partial<TableState> = {
      config: this.config,
      columnOrder: this.stateService.getColumnOrder(),
      columnWidths: this.stateService.getColumnWidths(),
      sortState: this.stateService.getSortState(),
      filterState: this.stateService.getFilterState()
    };
    
    this.storageService.saveTableState(this.config.tableId, state);
  }

  private updateConfig(config: TableConfig): void {
    // Update service with new config
    this.stateService.initializeTable(config, this.data || []);
    this.updateVisibleColumns();
  }

  private announce(message: string): void {
    this.announcement = message;
    this.cd.markForCheck();
    
    // Clear announcement after a delay
    setTimeout(() => {
      this.announcement = '';
      this.cd.markForCheck();
    }, 1000);
  }

  getThemeName(): string | undefined {
    if (!this.config?.theme) return undefined;
    
    if (typeof this.config.theme === 'string') {
      return this.config.theme;
    }
    
    return this.config.theme.name;
  }

  get currentSortState(): SortState | undefined {
    return this.stateService.getSortState() || undefined;
  }
}