import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { TableConfig } from '../interfaces/table-config.interface';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: Record<string, string>;

  const mockTableConfig: TableConfig = {
    tableId: 'test-table',
    columns: [
      { key: 'id', title: 'ID', type: 'text' },
      { key: 'name', title: 'Name', type: 'text' },
    ],
    virtualScrolling: true,
    stickyHeaders: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService],
    });
    service = TestBed.inject(LocalStorageService);

    // Mock localStorage
    mockLocalStorage = {};

    // Override localStorage methods
    Storage.prototype.getItem = (key: string) => mockLocalStorage[key] || null;
    Storage.prototype.setItem = (key: string, value: string) => {
      mockLocalStorage[key] = value;
    };
    Storage.prototype.removeItem = (key: string) => {
      delete mockLocalStorage[key];
    };
    Storage.prototype.clear = () => {
      mockLocalStorage = {};
    };

    // Mock length and key methods
    Object.defineProperty(Storage.prototype, 'length', {
      get: () => Object.keys(mockLocalStorage).length,
      configurable: true,
    });
    Storage.prototype.key = (index: number) =>
      Object.keys(mockLocalStorage)[index] || null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveTableState', () => {
    it('should save table state to localStorage', () => {
      const tableState = {
        config: mockTableConfig,
        columnOrder: ['id', 'name'],
        columnWidths: { id: 100, name: 200 },
        sortState: { column: 'id', direction: 'asc' as const },
        filterState: { name: 'test' },
        scrollPosition: { x: 0, y: 100 },
      };

      service.saveTableState('test-table', tableState);

      expect(mockLocalStorage['tableng_test-table']).toBe(
        JSON.stringify(tableState)
      );
    });

    it('should handle save errors gracefully', () => {
      Storage.prototype.setItem = () => {
        throw new Error('Storage full');
      };

      expect(() => {
        service.saveTableState('test-table', { config: mockTableConfig });
      }).not.toThrow();
    });
  });

  describe('loadTableState', () => {
    it('should load table state from localStorage', () => {
      const tableState = {
        config: mockTableConfig,
        columnOrder: ['id', 'name'],
        columnWidths: { id: 100, name: 200 },
      };
      mockLocalStorage['tableng_test-table'] = JSON.stringify(tableState);

      const result = service.loadTableState('test-table');

      expect(result).toEqual(tableState);
    });

    it('should return null when no state exists', () => {
      const result = service.loadTableState('non-existent-table');

      expect(result).toBeNull();
    });

    it('should return null when state is corrupted', () => {
      mockLocalStorage['tableng_corrupted-table'] = 'invalid json';

      const result = service.loadTableState('corrupted-table');

      expect(result).toBeNull();
    });
  });

  describe('removeTableState', () => {
    it('should remove table state from localStorage', () => {
      mockLocalStorage['tableng_test-table'] = JSON.stringify({
        config: mockTableConfig,
      });

      service.removeTableState('test-table');

      expect(mockLocalStorage['tableng_test-table']).toBeUndefined();
    });
  });

  describe('clearAllTableStates', () => {
    it('should remove all table states while preserving other localStorage items', () => {
      mockLocalStorage['tableng_table1'] = 'state1';
      mockLocalStorage['tableng_table2'] = 'state2';
      mockLocalStorage['other_key'] = 'other_value';

      service.clearAllTableStates();

      expect(mockLocalStorage['tableng_table1']).toBeUndefined();
      expect(mockLocalStorage['tableng_table2']).toBeUndefined();
      expect(mockLocalStorage['other_key']).toBeDefined();
    });
  });

  describe('getAllTableIds', () => {
    it('should return list of all stored table IDs', () => {
      mockLocalStorage['tableng_table1'] = 'state1';
      mockLocalStorage['tableng_table2'] = 'state2';
      mockLocalStorage['other_key'] = 'other_value';

      // Set up specific mock data for this test
      mockLocalStorage['tableng_table1'] = 'state1';
      mockLocalStorage['tableng_table2'] = 'state2';
      mockLocalStorage['other_key'] = 'other_value';

      const result = service.getAllTableIds();

      expect(result).toEqual(['table1', 'table2']);
    });

    it('should return empty array when no table states exist', () => {
      // Clear mock storage for this test
      mockLocalStorage = {};

      const result = service.getAllTableIds();

      expect(result).toEqual([]);
    });
  });

  describe('hasTableState', () => {
    it('should return true when table state exists', () => {
      mockLocalStorage['tableng_test-table'] = JSON.stringify({
        config: mockTableConfig,
      });

      const result = service.hasTableState('test-table');

      expect(result).toBe(true);
    });

    it('should return false when table state does not exist', () => {
      const result = service.hasTableState('non-existent-table');

      expect(result).toBe(false);
    });
  });

  describe('getStorageSize', () => {
    it('should calculate approximate storage size for table states', () => {
      mockLocalStorage['tableng_table1'] = 'a'.repeat(100);
      mockLocalStorage['tableng_table2'] = 'b'.repeat(200);
      mockLocalStorage['other_key'] = 'c'.repeat(50);

      // Set up mock storage with specific data sizes

      const result = service.getStorageSize();

      expect(result).toBeGreaterThan(300); // Should include key names + values
    });
  });

  describe('exportTableStates', () => {
    it('should export all table states as JSON', () => {
      const state1 = { config: mockTableConfig };
      const state2 = { config: { ...mockTableConfig, tableId: 'table2' } };

      mockLocalStorage['tableng_table1'] = JSON.stringify(state1);
      mockLocalStorage['tableng_table2'] = JSON.stringify(state2);

      // Mock storage data is already set up above

      const result = service.exportTableStates();

      expect(result).toEqual({
        table1: state1,
        table2: state2,
      });
    });
  });

  describe('importTableStates', () => {
    it('should import table states from JSON object', () => {
      const states = {
        table1: { config: mockTableConfig },
        table2: { config: { ...mockTableConfig, tableId: 'table2' } },
      };

      service.importTableStates(states);

      expect(mockLocalStorage['tableng_table1']).toBe(
        JSON.stringify(states.table1)
      );
      expect(mockLocalStorage['tableng_table2']).toBe(
        JSON.stringify(states.table2)
      );
    });

    it('should handle import errors gracefully', () => {
      Storage.prototype.setItem = () => {
        throw new Error('Storage error');
      };

      expect(() => {
        service.importTableStates({ table1: { config: mockTableConfig } });
      }).not.toThrow();
    });
  });
});
