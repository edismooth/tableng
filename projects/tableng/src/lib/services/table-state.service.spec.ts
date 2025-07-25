import { TestBed } from '@angular/core/testing';
import { TableStateService } from './table-state.service';
import { LocalStorageService } from './local-storage.service';
import { TableConfig } from '../interfaces/table-config.interface';
import { TableRow } from '../interfaces/table-row.interface';

describe('TableStateService', () => {
  let service: TableStateService;
  let mockLocalStorageService: jest.Mocked<LocalStorageService>;

  const mockTableConfig: TableConfig = {
    tableId: 'test-table',
    columns: [
      { key: 'id', title: 'ID', type: 'text', sortable: true },
      {
        key: 'name',
        title: 'Name',
        type: 'text',
        sortable: true,
        filterable: true,
      },
      { key: 'age', title: 'Age', type: 'number', sortable: true },
    ],
    treeMode: false,
    virtualScrolling: true,
    stickyHeaders: true,
    sorting: true,
    filtering: true,
    resizable: true,
    reorderable: true,
  };

  const mockData = [
    { id: '1', name: 'John', age: 30 },
    { id: '2', name: 'Jane', age: 25 },
    { id: '3', name: 'Bob', age: 35 },
  ];

  beforeEach(() => {
    const localStorageSpy = {
      saveTableState: jest.fn(),
      loadTableState: jest.fn().mockReturnValue(null),
      hasTableState: jest.fn().mockReturnValue(false),
      removeTableState: jest.fn(),
      clearAllTableStates: jest.fn(),
      getAllTableStates: jest.fn().mockReturnValue({}),
      exportTableStates: jest.fn().mockReturnValue('{}'),
      importTableStates: jest.fn(),
      getStorageSize: jest.fn().mockReturnValue(0),
      clearExpiredStates: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TableStateService,
        { provide: LocalStorageService, useValue: localStorageSpy },
      ],
    });

    service = TestBed.inject(TableStateService);
    mockLocalStorageService = TestBed.inject(
      LocalStorageService
    ) as jest.Mocked<LocalStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize table with config and data', () => {
      service.initializeTable(mockTableConfig, mockData);

      expect(service.getConfig()).toEqual(mockTableConfig);
      expect(service.getData().map(r => r.data)).toEqual(mockData);
      expect(service.getVisibleData().map(r => r.data)).toEqual(mockData);
    });

    it('should load persisted state if available', () => {
      const persistedState = {
        config: mockTableConfig,
        columnOrder: ['name', 'id', 'age'],
        columnWidths: { id: 150, name: 250 },
        sortState: { column: 'name', direction: 'asc' as const },
      };
      mockLocalStorageService.loadTableState.mockReturnValue(persistedState);
      const configWithTree = { ...mockTableConfig, treeMode: false };
      service.initializeTable(configWithTree, mockData);

      // LocalStorage method called internally
      expect(service.getColumnOrder()).toEqual(['name', 'id', 'age']);
      expect(service.getColumnWidths()).toEqual({ id: 150, name: 250 });
    });
  });

  describe('column management', () => {
    beforeEach(() => {
      // Create fresh config to avoid state leakage between tests
      const freshConfig: TableConfig = {
        tableId: 'test-table',
        columns: [
          { key: 'id', title: 'ID', type: 'text', sortable: true },
          {
            key: 'name',
            title: 'Name',
            type: 'text',
            sortable: true,
            filterable: true,
          },
          { key: 'age', title: 'Age', type: 'number', sortable: true },
        ],
        treeMode: false,
        virtualScrolling: true,
        stickyHeaders: true,
        sorting: true,
        filtering: true,
        resizable: true,
        reorderable: true,
      };
      service.initializeTable(freshConfig, mockData);
    });

    it('should get column order', () => {
      const order = service.getColumnOrder();
      expect(order).toEqual(['id', 'name', 'age']);
    });

    it('should reorder columns', () => {
      service.reorderColumns(['name', 'age', 'id']);

      expect(service.getColumnOrder()).toEqual(['name', 'age', 'id']);
    });

    it('should get column widths', () => {
      const widths = service.getColumnWidths();
      expect(widths).toEqual({});
    });

    it('should set column width', () => {
      service.setColumnWidth('name', 200);

      const widths = service.getColumnWidths();
      expect(widths['name']).toBe(200);
    });

    it('should toggle column visibility', () => {
      service.toggleColumnVisibility('name', false);

      const allColumns = service.getAllColumns();
      expect(allColumns.find(col => col.key === 'name')?.visible).toBe(false);
    });

    it('should get visible columns only', () => {
      service.toggleColumnVisibility('age', false);

      const visibleColumns = service.getVisibleColumns();
      expect(visibleColumns.length).toBe(2);
      expect(visibleColumns.find(col => col.key === 'age')).toBeUndefined();
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      service.initializeTable(mockTableConfig, mockData);
    });

    it('should sort by column ascending', () => {
      service.sortByColumn('name', 'asc');

      const sortState = service.getSortState();
      expect(sortState).toEqual({ column: 'name', direction: 'asc' });

      const visibleData = service.getVisibleData();
      expect(visibleData[0].data.name).toBe('Bob');
      expect(visibleData[1].data.name).toBe('Jane');
      expect(visibleData[2].data.name).toBe('John');
    });

    it('should sort by column descending', () => {
      service.sortByColumn('age', 'desc');

      const sortState = service.getSortState();
      expect(sortState).toEqual({ column: 'age', direction: 'desc' });

      const visibleData = service.getVisibleData();
      expect(visibleData[0].data.age).toBe(35);
      expect(visibleData[1].data.age).toBe(30);
      expect(visibleData[2].data.age).toBe(25);
    });

    it('should clear sort when sorting by same column with none direction', () => {
      service.sortByColumn('name', 'asc');
      service.sortByColumn('name', 'none');

      const sortState = service.getSortState();
      expect(sortState).toBeNull();

      const visibleData = service.getVisibleData();
      expect(visibleData.map(r => r.data)).toEqual(mockData);
    });

    it('should cycle through sort directions', () => {
      // First click: asc
      service.cycleSortDirection('name');
      expect(service.getSortState()?.direction).toBe('asc');

      // Second click: desc
      service.cycleSortDirection('name');
      expect(service.getSortState()?.direction).toBe('desc');

      // Third click: none
      service.cycleSortDirection('name');
      expect(service.getSortState()).toBeNull();
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      service.initializeTable(mockTableConfig, mockData);
    });

    it('should filter by column value', () => {
      service.setColumnFilter('name', 'Jo');

      const filterState = service.getFilterState();
      expect(filterState['name']).toBe('Jo');

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(1);
      expect(visibleData[0].data.name).toBe('John');
    });

    it('should filter by multiple columns', () => {
      service.setColumnFilter('name', 'J');
      service.setColumnFilter('age', '30');

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(1);
      expect(visibleData[0].data.name).toBe('John');
    });

    it('should clear single column filter', () => {
      service.setColumnFilter('name', 'Jo');
      service.clearColumnFilter('name');

      const filterState = service.getFilterState();
      expect(filterState['name']).toBeUndefined();

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(3);
    });

    it('should clear all filters', () => {
      service.setColumnFilter('name', 'Jo');
      service.setColumnFilter('age', '30');
      service.clearAllFilters();

      const filterState = service.getFilterState();
      expect(Object.keys(filterState).length).toBe(0);

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(3);
    });
  });

  describe('combined sorting and filtering', () => {
    beforeEach(() => {
      service.initializeTable(mockTableConfig, mockData);
    });

    it('should apply filters first, then sorting', () => {
      // Add more test data
      const extendedData = [...mockData, { id: '4', name: 'Jack', age: 28 }];
      service.updateData(extendedData);

      // Filter by names starting with 'J', then sort by age
      service.setColumnFilter('name', 'J');
      service.sortByColumn('age', 'asc');

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(3); // John, Jane, Jack
      expect(visibleData[0].data.name).toBe('Jane'); // age 25
      expect(visibleData[1].data.name).toBe('Jack'); // age 28
      expect(visibleData[2].data.name).toBe('John'); // age 30
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      service.initializeTable(mockTableConfig, mockData);
    });

    it('should update data and refresh visible data', () => {
      const newData = [{ id: '5', name: 'Alice', age: 40 }];

      service.updateData(newData);

      expect(service.getData().map(r => r.data)).toEqual(newData);
      expect(service.getVisibleData().map(r => r.data)).toEqual(newData);
    });

    it('should preserve filters when updating data', () => {
      service.setColumnFilter('name', 'Jo');

      const newData = [...mockData, { id: '4', name: 'Joe', age: 45 }];

      service.updateData(newData);

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(2); // John and Joe
    });
  });

  describe('state observables', () => {
    beforeEach(() => {
      service.initializeTable(mockTableConfig, mockData);
    });

    it('should emit config changes', done => {
      service.config$.subscribe(config => {
        expect(config).toEqual(mockTableConfig);
        done();
      });
    });

    it('should emit visible data changes', done => {
      service.visibleData$.subscribe(data => {
        expect(data.map(r => r.data)).toEqual(mockData);
        done();
      });
    });

    it('should emit sort state changes', done => {
      service.sortState$.subscribe(sortState => {
        if (sortState) {
          expect(sortState).toEqual({ column: 'name', direction: 'asc' });
          done();
        }
      });

      service.sortByColumn('name', 'asc');
    });

    it('should emit filter state changes', done => {
      service.filterState$.subscribe(filterState => {
        if (Object.keys(filterState).length > 0) {
          expect(filterState['name']).toBe('Jo');
          done();
        }
      });

      service.setColumnFilter('name', 'Jo');
    });
  });

  describe('Tree-Grid State Management', () => {
    let treeData: TableRow<any>[];

    beforeEach(() => {
      treeData = [
        {
          data: { id: '1', name: 'Root 1' },
          level: 0,
          expanded: false,
          children: [
            {
              data: { id: '1.1', name: 'Child 1.1' },
              level: 1,
              expanded: false,
            },
          ],
        },
        {
          data: { id: '2', name: 'Root 2' },
          level: 0,
          expanded: true,
          children: [
            {
              data: { id: '2.1', name: 'Child 2.1' },
              level: 1,
              expanded: false,
            },
          ],
        },
      ];
      const treeConfig: TableConfig = { ...mockTableConfig, treeMode: true };
      service.initializeTable(treeConfig, treeData);
    });

    it('should initialize with tree data and respect initial expanded state', () => {
      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(3); // Root 1, Root 2, Child 2.1
      expect(visibleData.find(row => row.data.id === '1.1')).toBeFalsy();
    });

    it('should expand a collapsed row', () => {
      const rowToExpand = service.getData()[0] as TableRow<any>; // Root 1
      service.toggleRowExpansion(rowToExpand);

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(4); // All rows should be visible
      expect(rowToExpand.expanded).toBe(true);
    });

    it('should collapse an expanded row', () => {
      const rowToCollapse = service.getData()[1] as TableRow<any>; // Root 2
      service.toggleRowExpansion(rowToCollapse);

      const visibleData = service.getVisibleData();
      expect(visibleData.length).toBe(2); // Root 1, Root 2
      expect(rowToCollapse.expanded).toBe(false);
    });

    it('should not affect other rows when toggling', () => {
      const rowToToggle = service.getData()[0] as TableRow<any>; // Root 1
      service.toggleRowExpansion(rowToToggle);

      const otherRow = service.getData()[1] as TableRow<any>; // Root 2
      expect(otherRow.expanded).toBe(true); // Should remain unchanged
    });
  });
});
