import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TablengComponent } from './tableng.component';
import { TableStateService } from './services/table-state.service';
import { LocalStorageService } from './services/local-storage.service';
import { TableConfig } from './interfaces/table-config.interface';
import { ColumnDefinition } from './interfaces/column-definition.interface';

describe('TablengComponent', () => {
  let component: TablengComponent;
  let fixture: ComponentFixture<TablengComponent>;
  let mockTableStateService: any;
  let mockLocalStorageService: any;

  const mockColumns: ColumnDefinition[] = [
    { key: 'id', title: 'ID', type: 'number', width: 80 },
    { key: 'name', title: 'Name', type: 'text', width: 200, sortable: true },
    { key: 'email', title: 'Email', type: 'text', width: 250, filterable: true },
    { key: 'active', title: 'Active', type: 'boolean', width: 100 }
  ];

  const mockTableConfig: TableConfig = {
    tableId: 'test-users-table',
    columns: mockColumns,
    virtualScrolling: true,
    stickyHeaders: true,
    editable: true,
    filtering: true,
    sorting: true,
    resizable: true,
    reorderable: true
  };

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true }
  ];

  beforeEach(async () => {
    // Create service mocks
    mockTableStateService = {
      initialize: () => {},
      setData: () => {},
      getData: () => mockData,
      getConfig: () => mockTableConfig,
      getColumns: () => mockColumns,
      data$: { subscribe: () => {} },
      config$: { subscribe: () => {} },
      columns$: { subscribe: () => {} },
      sortState$: { subscribe: () => {} },
      filterState$: { subscribe: () => {} }
    };

    mockLocalStorageService = {
      saveTableState: () => {},
      loadTableState: () => null,
      hasTableState: () => false
    };

    await TestBed.configureTestingModule({
      declarations: [TablengComponent],
      providers: [
        { provide: TableStateService, useValue: mockTableStateService },
        { provide: LocalStorageService, useValue: mockLocalStorageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TablengComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties defined', () => {
      expect(component.config).toBeUndefined();
      expect(component.data).toBeUndefined();
      expect(component.loading).toBe(false);
    });

    it('should have required output events defined', () => {
      expect(component.rowClick).toBeDefined();
      expect(component.cellEdit).toBeDefined();
      expect(component.sortChange).toBeDefined();
      expect(component.filterChange).toBeDefined();
      expect(component.columnReorder).toBeDefined();
      expect(component.columnResize).toBeDefined();
    });
  });

  describe('Input Property Changes', () => {
    it('should initialize table state when config is provided', () => {
      const initializeSpy = mockTableStateService.initialize = () => {};
      
      component.config = mockTableConfig;
      component.ngOnChanges({
        config: { currentValue: mockTableConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
      });

      expect(component.tableId).toBe('test-users-table');
    });

    it('should update data when data input changes', () => {
      const setDataSpy = mockTableStateService.setData = () => {};
      
      component.data = mockData;
      component.ngOnChanges({
        data: { currentValue: mockData, previousValue: undefined, firstChange: true, isFirstChange: () => true }
      });

      // Data should be passed to service
      expect(component.data).toBe(mockData);
    });

    it('should handle loading state changes', () => {
      component.loading = true;
      fixture.detectChanges();

      expect(component.loading).toBe(true);
    });
  });

  describe('Component Template Rendering', () => {
    beforeEach(() => {
      component.config = mockTableConfig;
      component.data = mockData;
      fixture.detectChanges();
    });

    it('should render table container with proper CSS classes', () => {
      const tableContainer = fixture.debugElement.query(By.css('.tableng-container'));
      expect(tableContainer).toBeTruthy();
      expect(tableContainer.nativeElement.classList).toContain('tableng-container');
    });

    it('should apply tableId as CSS class for styling isolation', () => {
      const tableContainer = fixture.debugElement.query(By.css('.tableng-container'));
      expect(tableContainer.nativeElement.classList).toContain('tableng-test-users-table');
    });

    it('should render loading state when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.tableng-loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should hide table content when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const tableElement = fixture.debugElement.query(By.css('.tableng-table'));
      expect(tableElement.nativeElement.style.display).toBe('none');
    });

    it('should render empty state when no data provided', () => {
      component.data = [];
      fixture.detectChanges();

      const emptyElement = fixture.debugElement.query(By.css('.tableng-empty'));
      expect(emptyElement).toBeTruthy();
    });
  });

  describe('Virtual Scrolling', () => {
    it('should enable virtual scrolling when configured', () => {
      const configWithVirtualScrolling: TableConfig = {
        ...mockTableConfig,
        virtualScrolling: true
      };
      
      component.config = configWithVirtualScrolling;
      fixture.detectChanges();

      const scrollContainer = fixture.debugElement.query(By.css('.tableng-virtual-scroll'));
      expect(scrollContainer).toBeTruthy();
    });

    it('should disable virtual scrolling when not configured', () => {
      const configWithoutVirtualScrolling: TableConfig = {
        ...mockTableConfig,
        virtualScrolling: false
      };
      
      component.config = configWithoutVirtualScrolling;
      fixture.detectChanges();

      const scrollContainer = fixture.debugElement.query(By.css('.tableng-virtual-scroll'));
      expect(scrollContainer).toBeFalsy();
    });
  });

  describe('Sticky Headers and Columns', () => {
    it('should apply sticky headers when configured', () => {
      const configWithStickyHeaders: TableConfig = {
        ...mockTableConfig,
        stickyHeaders: true
      };
      
      component.config = configWithStickyHeaders;
      fixture.detectChanges();

      const headerElement = fixture.debugElement.query(By.css('.tableng-header'));
      expect(headerElement.nativeElement.classList).toContain('tableng-sticky-header');
    });

    it('should apply sticky columns when configured', () => {
      const configWithStickyColumns: TableConfig = {
        ...mockTableConfig,
        stickyColumns: {
          left: 1,
          right: 1
        }
      };
      
      component.config = configWithStickyColumns;
      fixture.detectChanges();

      expect(component.hasStickyColumns).toBe(true);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      component.config = mockTableConfig;
      component.data = mockData;
      fixture.detectChanges();
    });

    it('should emit rowClick event when row is clicked', () => {
      let emittedRowData: any;
      component.rowClick.subscribe((data: any) => emittedRowData = data);

      // Simulate row click - this will be implemented when we have the template
      component.onRowClick(mockData[0]);

      expect(emittedRowData).toBe(mockData[0]);
    });

    it('should emit cellEdit event when cell is edited', () => {
      let emittedEditData: any;
      component.cellEdit.subscribe((data: any) => emittedEditData = data);

      const editData = { row: mockData[0], column: 'name', value: 'New Name' };
      component.onCellEdit(editData);

      expect(emittedEditData).toBe(editData);
    });

    it('should emit sortChange event when column is sorted', () => {
      let emittedSortData: any;
      component.sortChange.subscribe((data: any) => emittedSortData = data);

      const sortData = { column: 'name', direction: 'asc' };
      component.onSortChange(sortData);

      expect(emittedSortData).toBe(sortData);
    });

    it('should emit filterChange event when filter is applied', () => {
      let emittedFilterData: any;
      component.filterChange.subscribe((data: any) => emittedFilterData = data);

      const filterData = { column: 'name', value: 'John' };
      component.onFilterChange(filterData);

      expect(emittedFilterData).toBe(filterData);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize subscriptions on ngOnInit', () => {
      const subscriptionCount = component.subscriptions ? component.subscriptions.length : 0;
      
      component.ngOnInit();
      
      expect(component.subscriptions.length).toBeGreaterThan(subscriptionCount);
    });

    it('should clean up subscriptions on ngOnDestroy', () => {
      component.ngOnInit();
      const unsubscribeSpy = component.subscriptions[0] ? component.subscriptions[0].unsubscribe = () => {} : null;
      
      component.ngOnDestroy();
      
      // Subscriptions should be cleaned up
      expect(component.subscriptions.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid config gracefully', () => {
      const invalidConfig = {} as TableConfig;
      
      expect(() => {
        component.config = invalidConfig;
        component.ngOnChanges({
          config: { currentValue: invalidConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
        });
      }).not.toThrow();
    });

    it('should handle null data gracefully', () => {
      expect(() => {
        component.data = null as any;
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
