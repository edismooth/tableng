import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablengComponent } from './tableng.component';
import { TableHeaderComponent } from './components/table-header.component';
import { TableBodyComponent } from './components/table-body.component';
import { TableRowComponent } from './components/table-row.component';
import { TableCellComponent } from './components/table-cell.component';
import { TableStateService } from './services/table-state.service';
import { LocalStorageService } from './services/local-storage.service';
import { TableConfig } from './interfaces/table-config.interface';
import { ColumnDefinition } from './interfaces/column-definition.interface';
import { of } from 'rxjs';

declare const jest: any;

describe('TablengComponent', () => {
  let component: TablengComponent;
  let fixture: ComponentFixture<TablengComponent>;
  let stateService: TableStateService;
  let storageService: LocalStorageService;

  const mockColumns: ColumnDefinition[] = [
    { key: 'id', title: 'ID', type: 'number', width: 80, sortable: true },
    {
      key: 'name',
      title: 'Name',
      type: 'text',
      width: 200,
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      key: 'email',
      title: 'Email',
      type: 'text',
      width: 250,
      filterable: true,
      editable: true,
    },
    {
      key: 'active',
      title: 'Active',
      type: 'boolean',
      width: 100,
      editable: true,
    },
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true },
  ];

  const mockConfig: TableConfig = {
    tableId: 'test-table',
    columns: mockColumns,
    virtualScrolling: false,
    stickyHeaders: true,
    filtering: true,
    sorting: true,
    resizable: true,
    reorderable: true,
    selectable: true,
    editable: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TablengComponent,
        TableHeaderComponent,
        TableBodyComponent,
        TableRowComponent,
        TableCellComponent,
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [TableStateService, LocalStorageService],
    }).compileComponents();

    fixture = TestBed.createComponent(TablengComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(TableStateService);
    storageService = TestBed.inject(LocalStorageService);

    // Set default inputs - create new instances to avoid mutation
    component.config = { ...mockConfig };
    component.data = mockData.map(item => ({ ...item })); // Create new objects
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties', () => {
      expect(component.config).toBeDefined();
      expect(component.data).toBeDefined();
    });

    it('should have output events', () => {
      expect(component.rowClick).toBeDefined();
      expect(component.rowSelect).toBeDefined();
      expect(component.cellEdit).toBeDefined();
      expect(component.dataChange).toBeDefined();
      expect(component.sortChange).toBeDefined();
      expect(component.filterChange).toBeDefined();
      expect(component.columnResize).toBeDefined();
      expect(component.columnReorder).toBeDefined();
    });

    it('should initialize table state service with config', () => {
      jest.spyOn(stateService, 'initializeTable');
      component.ngOnInit();

      expect(stateService.initializeTable).toHaveBeenCalledWith(
        mockConfig,
        mockData
      );
    });

    it('should set data in state service', () => {
      jest.spyOn(stateService, 'initializeTable');
      component.ngOnInit();

      expect(stateService.initializeTable).toHaveBeenCalledWith(
        mockConfig,
        mockData
      );
    });

    it('should restore saved state if available', () => {
      const savedState = {
        config: mockConfig,
        columnOrder: ['name', 'id', 'email', 'active'],
        columnWidths: { id: 100, name: 250 },
        sortState: { column: 'name', direction: 'asc' as const },
        filterState: { name: 'John' },
      };

      jest.spyOn(storageService, 'loadTableState').mockReturnValue(savedState);

      component.ngOnInit();

      expect(storageService.loadTableState).toHaveBeenCalledWith(
        mockConfig.tableId
      );
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render table container', () => {
      const container = fixture.debugElement.query(
        By.css('.tableng-container')
      );
      expect(container).toBeTruthy();
    });

    it('should render table element', () => {
      const table = fixture.debugElement.query(By.css('.tableng-table'));
      expect(table).toBeTruthy();
    });

    it('should render header component', () => {
      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      expect(header).toBeTruthy();
    });

    it('should render body component', () => {
      const body = fixture.debugElement.query(By.directive(TableBodyComponent));
      expect(body).toBeTruthy();
    });

    it('should pass correct props to header component', () => {
      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      const headerComponent = header.componentInstance;

      expect(headerComponent.columns).toBeDefined();
      expect(headerComponent.config).toBeDefined();
      expect(headerComponent.config?.sorting).toBe(true);
      expect(headerComponent.config?.filtering).toBe(true);
      expect(headerComponent.config?.resizable).toBe(true);
      expect(headerComponent.config?.reorderable).toBe(true);
    });

    it('should pass correct props to body component', () => {
      const body = fixture.debugElement.query(By.directive(TableBodyComponent));
      const bodyComponent = body.componentInstance;

      expect(bodyComponent.data).toBeDefined();
      expect(bodyComponent.columns).toBeDefined();
      expect(bodyComponent.config).toBeDefined();
      expect(bodyComponent.config?.selectable).toBe(true);
      expect(bodyComponent.config?.editable).toBe(true);
    });

    it('should apply sticky header class when configured', () => {
      const table = fixture.debugElement.query(By.css('.tableng-table'));
      expect(table.nativeElement.classList).toContain('tableng-sticky-header');
    });

    it('should apply theme classes when configured', () => {
      component.config = {
        ...mockConfig,
        theme: {
          name: 'dark',
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            background: '#1a1a1a',
            surface: '#2a2a2a',
            text: '#ffffff',
            textSecondary: '#cccccc',
            border: '#404040',
            hover: '#3a3a3a',
            selected: '#4a4a4a',
            error: '#dc3545',
            warning: '#ffc107',
            success: '#28a745',
          },
        },
      };
      component.ngOnInit(); // Re-initialize to pick up new config
      fixture.detectChanges();

      const container = fixture.debugElement.query(
        By.css('.tableng-container')
      );
      expect(container.nativeElement.classList).toContain('tableng-theme-dark');
    });
  });

  describe('Data Binding and Updates', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update when data changes', () => {
      const newData = [
        ...mockData,
        { id: 4, name: 'New User', email: 'new@example.com', active: true },
      ];
      jest.spyOn(stateService, 'updateData');

      component.data = newData;
      component.ngOnChanges({
        data: {
          currentValue: newData,
          previousValue: mockData,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(stateService.updateData).toHaveBeenCalledWith(newData);
    });

    it('should update when config changes', () => {
      const newConfig = { ...mockConfig, sorting: false };
      jest.spyOn(stateService, 'initializeTable');

      component.config = newConfig;
      component.ngOnChanges({
        config: {
          currentValue: newConfig,
          previousValue: mockConfig,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(stateService.initializeTable).toHaveBeenCalledWith(
        newConfig,
        component.data || []
      );
    });

    it('should subscribe to filtered data changes', () => {
      const filteredData = [mockData[0]];
      jest
        .spyOn(stateService.visibleData$, 'pipe')
        .mockReturnValue(of(filteredData));

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.filteredData).toBeDefined();
    });

    it('should subscribe to column changes', () => {
      jest
        .spyOn(stateService, 'getColumnOrder')
        .mockReturnValue(['name', 'id', 'email', 'active']);
      jest.spyOn(stateService, 'getColumnWidths').mockReturnValue({});

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.visibleColumns).toBeDefined();
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle sort events from header', () => {
      jest.spyOn(stateService, 'sortByColumn');
      jest.spyOn(component.sortChange, 'emit');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.sortChange.emit({
        column: 'name',
        direction: 'asc',
      });

      expect(stateService.sortByColumn).toHaveBeenCalledWith('name', 'asc');
      expect(component.sortChange.emit).toHaveBeenCalledWith({
        column: 'name',
        direction: 'asc',
      });
    });

    it('should persist sort state', fakeAsync(() => {
      jest.spyOn(storageService, 'saveTableState');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.sortChange.emit({
        column: 'name',
        direction: 'asc',
      });

      tick(500); // Debounce delay

      expect(storageService.saveTableState).toHaveBeenCalled();

      // Flush any remaining timers
      tick(1000);
    }));
  });

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle filter events from header', () => {
      jest.spyOn(stateService, 'setColumnFilter');
      jest.spyOn(component.filterChange, 'emit');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.filterChange.emit({
        column: 'name',
        value: 'John',
      });

      expect(stateService.setColumnFilter).toHaveBeenCalledWith('name', 'John');
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        column: 'name',
        value: 'John',
      });
    });

    it('should persist filter state', fakeAsync(() => {
      jest.spyOn(storageService, 'saveTableState');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.filterChange.emit({
        column: 'name',
        value: 'John',
      });

      tick(500); // Debounce delay

      expect(storageService.saveTableState).toHaveBeenCalled();

      // Flush any remaining timers
      tick(1000);
    }));

    it('should clear all filters', () => {
      jest.spyOn(stateService, 'clearAllFilters');

      component.clearFilters();

      expect(stateService.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('Column Resizing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle column resize events', () => {
      jest.spyOn(stateService, 'setColumnWidth');
      jest.spyOn(component.columnResize, 'emit');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.columnResize.emit({
        column: 'name',
        width: 300,
      });

      expect(stateService.setColumnWidth).toHaveBeenCalledWith('name', 300);
      expect(component.columnResize.emit).toHaveBeenCalledWith({
        column: 'name',
        width: 300,
      });
    });

    it('should persist column widths', fakeAsync(() => {
      jest.spyOn(storageService, 'saveTableState');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.columnResize.emit({
        column: 'name',
        width: 300,
      });

      tick(500); // Debounce delay

      expect(storageService.saveTableState).toHaveBeenCalled();
    }));
  });

  describe('Column Reordering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle column reorder events', () => {
      jest.spyOn(stateService, 'reorderColumns');
      jest
        .spyOn(stateService, 'getColumnOrder')
        .mockReturnValue(['id', 'name', 'email', 'active']);
      jest.spyOn(component.columnReorder, 'emit');

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.columnReorder.emit({
        from: 0,
        to: 2,
      });

      expect(stateService.reorderColumns).toHaveBeenCalledWith([
        'name',
        'email',
        'id',
        'active',
      ]);
      expect(component.columnReorder.emit).toHaveBeenCalledWith({
        from: 0,
        to: 2,
      });
    });

    it('should persist column order', fakeAsync(() => {
      jest.spyOn(storageService, 'saveTableState');
      jest
        .spyOn(stateService, 'getColumnOrder')
        .mockReturnValue(['id', 'name', 'email', 'active']);

      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.columnReorder.emit({
        from: 0,
        to: 2,
      });

      tick(500); // Debounce delay

      expect(storageService.saveTableState).toHaveBeenCalled();

      // Flush any remaining timers
      tick(1000);
    }));
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle row selection events', () => {
      jest.spyOn(component.rowSelect, 'emit');

      const body = fixture.debugElement.query(By.directive(TableBodyComponent));
      body.componentInstance.rowSelect.emit({
        rowIndex: 0,
        rowData: mockData[0],
        selected: true,
      });

      expect(component.rowSelect.emit).toHaveBeenCalledWith({
        rowIndex: 0,
        rowData: mockData[0],
        selected: true,
      });
    });

    it('should track selected rows', () => {
      const body = fixture.debugElement.query(By.directive(TableBodyComponent));

      body.componentInstance.rowSelect.emit({
        rowIndex: 0,
        rowData: mockData[0],
        selected: true,
      });

      expect(component.selectedRows).toContain(mockData[0]);

      body.componentInstance.rowSelect.emit({
        rowIndex: 0,
        rowData: mockData[0],
        selected: false,
      });

      expect(component.selectedRows).not.toContain(mockData[0]);
    });

    it('should implement select all functionality', () => {
      component.filteredData = mockData;
      component.selectAll();
      expect(component.selectedRows).toEqual(mockData);

      component.deselectAll();
      expect(component.selectedRows).toEqual([]);
    });
  });

  describe('Cell Editing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle cell edit events', () => {
      jest.spyOn(component.cellEdit, 'emit');
      jest.spyOn(component.dataChange, 'emit');

      const body = fixture.debugElement.query(By.directive(TableBodyComponent));
      body.componentInstance.cellChange.emit({
        rowIndex: 0,
        column: 'name',
        oldValue: 'John Doe',
        newValue: 'Jane Doe',
      });

      expect(component.cellEdit.emit).toHaveBeenCalled();
      expect(component.dataChange.emit).toHaveBeenCalled();
    });

    it('should update data on cell edit', () => {
      const body = fixture.debugElement.query(By.directive(TableBodyComponent));

      body.componentInstance.cellChange.emit({
        rowIndex: 0,
        column: 'name',
        oldValue: 'John Doe',
        newValue: 'Jane Doe',
      });

      expect(component.data![0].name).toBe('Jane Doe');
    });
  });

  describe('Virtual Scrolling', () => {
    it('should enable virtual scrolling when configured', () => {
      component.config = { ...mockConfig, virtualScrolling: true };
      fixture.detectChanges();

      const container = fixture.debugElement.query(
        By.css('.tableng-container')
      );
      expect(container.nativeElement.classList).toContain(
        'tableng-virtual-scroll'
      );
    });

    it('should pass virtual scrolling config to body component', () => {
      component.config = { ...mockConfig, virtualScrolling: true };
      component.ngOnInit(); // Re-initialize with new config
      fixture.detectChanges();

      const body = fixture.debugElement.query(By.directive(TableBodyComponent));
      expect(body.componentInstance.config?.virtualScrolling).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes on table', () => {
      const table = fixture.debugElement.query(By.css('.tableng-table'));
      expect(table.nativeElement.getAttribute('role')).toBe('table');
      expect(table.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have keyboard navigation support', () => {
      const table = fixture.debugElement.query(By.css('.tableng-table'));
      expect(table.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should announce table updates to screen readers', () => {
      const announcer = fixture.debugElement.query(
        By.css('.tableng-sr-announcer')
      );
      expect(announcer).toBeTruthy();
      expect(announcer.nativeElement.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing config gracefully', () => {
      component.config = null as any;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle missing data gracefully', () => {
      component.data = null as any;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle invalid column configuration', () => {
      component.config = { ...mockConfig, columns: [] };
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should cleanup subscriptions on destroy', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      fixture.destroy();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should debounce state saves', fakeAsync(() => {
      // Clean setup - don't call ngOnInit explicitly as it's already called
      jest.spyOn(storageService, 'saveTableState');
      fixture.detectChanges(); // This triggers ngOnInit

      // Multiple rapid changes
      const header = fixture.debugElement.query(
        By.directive(TableHeaderComponent)
      );
      header.componentInstance.columnResize.emit({
        column: 'name',
        width: 300,
      });
      header.componentInstance.columnResize.emit({
        column: 'name',
        width: 350,
      });
      header.componentInstance.columnResize.emit({
        column: 'name',
        width: 400,
      });

      tick(500);

      // Should only save once
      expect(storageService.saveTableState).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Public API Methods', () => {
    it('should export data as CSV', () => {
      component.visibleColumns = mockColumns;
      component.filteredData = mockData;

      const csv = component.exportToCSV();
      expect(csv).toContain('ID,Name,Email,Active');
      expect(csv).toContain('John Doe');
    });

    it('should refresh data', () => {
      jest.spyOn(stateService, 'updateData');
      component.refresh();
      expect(stateService.updateData).toHaveBeenCalledWith(mockData);
    });

    it('should reset table state', () => {
      jest.spyOn(stateService, 'initializeTable');
      jest.spyOn(storageService, 'removeTableState');

      component.resetState();

      expect(stateService.initializeTable).toHaveBeenCalled();
      expect(storageService.removeTableState).toHaveBeenCalledWith(
        mockConfig.tableId
      );
    });
  });
});
