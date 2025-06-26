import { TableConfig, StickyColumns } from './table-config.interface';
import { ColumnDefinition } from './column-definition.interface';
import { TableTheme } from './table-theme.interface';

describe('TableConfig Interface', () => {
  describe('Type Structure', () => {
    it('should allow a minimal valid configuration', () => {
      const config: TableConfig = {
        tableId: 'test-table',
        columns: [],
      };

      expect(config.tableId).toBe('test-table');
      expect(config.columns).toEqual([]);
    });

    it('should allow a complete configuration with all optional properties', () => {
      const mockColumns: ColumnDefinition[] = [
        { key: 'id', title: 'ID', type: 'text' },
      ];

      const mockTheme: TableTheme = {
        name: 'custom',
        colors: { primary: '#000' },
      };

      const config: TableConfig = {
        tableId: 'complete-table',
        columns: mockColumns,
        virtualScrolling: true,
        stickyHeaders: true,
        stickyColumns: { left: 1, right: 0 },
        theme: mockTheme,
        editable: true,
        treeMode: false,
        filtering: true,
        sorting: true,
        resizable: true,
        reorderable: true,
        rowHeight: 40,
        headerHeight: 50,
      };

      expect(config.tableId).toBe('complete-table');
      expect(config.columns).toBe(mockColumns);
      expect(config.virtualScrolling).toBe(true);
      expect(config.stickyHeaders).toBe(true);
      expect(config.stickyColumns?.left).toBe(1);
      expect(config.theme).toBe(mockTheme);
      expect(config.editable).toBe(true);
      expect(config.treeMode).toBe(false);
    });

    it('should allow theme as string', () => {
      const config: TableConfig = {
        tableId: 'themed-table',
        columns: [],
        theme: 'dark',
      };

      expect(config.theme).toBe('dark');
    });

    it('should allow theme as TableTheme object', () => {
      const customTheme: TableTheme = {
        name: 'custom',
        colors: { primary: '#ff0000' },
      };

      const config: TableConfig = {
        tableId: 'custom-themed-table',
        columns: [],
        theme: customTheme,
      };

      expect(config.theme).toBe(customTheme);
    });
  });

  describe('Required Properties', () => {
    it('should require tableId property', () => {
      // This test ensures tableId is not optional
      // TypeScript will enforce this at compile time
      const config: TableConfig = {
        tableId: 'required-id',
        columns: [],
      };

      expect(config.tableId).toBeDefined();
      expect(typeof config.tableId).toBe('string');
    });

    it('should require columns property', () => {
      // This test ensures columns is not optional
      // TypeScript will enforce this at compile time
      const config: TableConfig = {
        tableId: 'test',
        columns: [],
      };

      expect(config.columns).toBeDefined();
      expect(Array.isArray(config.columns)).toBe(true);
    });
  });

  describe('Optional Properties Defaults', () => {
    it('should handle undefined optional properties gracefully', () => {
      const config: TableConfig = {
        tableId: 'minimal-table',
        columns: [],
      };

      // All optional properties should be undefined when not set
      expect(config.virtualScrolling).toBeUndefined();
      expect(config.stickyHeaders).toBeUndefined();
      expect(config.stickyColumns).toBeUndefined();
      expect(config.theme).toBeUndefined();
      expect(config.editable).toBeUndefined();
      expect(config.treeMode).toBeUndefined();
      expect(config.filtering).toBeUndefined();
      expect(config.sorting).toBeUndefined();
      expect(config.resizable).toBeUndefined();
      expect(config.reorderable).toBeUndefined();
    });
  });

  describe('StickyColumns Type', () => {
    it('should allow empty sticky columns object', () => {
      const stickyColumns: StickyColumns = {};

      expect(stickyColumns.left).toBeUndefined();
      expect(stickyColumns.right).toBeUndefined();
    });

    it('should allow left sticky columns only', () => {
      const stickyColumns: StickyColumns = { left: 2 };

      expect(stickyColumns.left).toBe(2);
      expect(stickyColumns.right).toBeUndefined();
    });

    it('should allow right sticky columns only', () => {
      const stickyColumns: StickyColumns = { right: 1 };

      expect(stickyColumns.left).toBeUndefined();
      expect(stickyColumns.right).toBe(1);
    });

    it('should allow both left and right sticky columns', () => {
      const stickyColumns: StickyColumns = { left: 1, right: 2 };

      expect(stickyColumns.left).toBe(1);
      expect(stickyColumns.right).toBe(2);
    });
  });

  describe('Validation Logic', () => {
    it('should validate tableId is not empty', () => {
      const isValidTableId = (id: string): boolean => {
        return id.length > 0 && id.trim().length > 0;
      };

      expect(isValidTableId('valid-id')).toBe(true);
      expect(isValidTableId('')).toBe(false);
      expect(isValidTableId('   ')).toBe(false);
    });

    it('should validate sticky columns are non-negative', () => {
      const isValidStickyColumns = (sticky: StickyColumns): boolean => {
        const leftValid = sticky.left === undefined || sticky.left >= 0;
        const rightValid = sticky.right === undefined || sticky.right >= 0;
        return leftValid && rightValid;
      };

      expect(isValidStickyColumns({ left: 0, right: 0 })).toBe(true);
      expect(isValidStickyColumns({ left: 1, right: 2 })).toBe(true);
      expect(isValidStickyColumns({ left: -1 })).toBe(false);
      expect(isValidStickyColumns({ right: -1 })).toBe(false);
    });
  });
});
