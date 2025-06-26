import { ColumnDefinition } from './column-definition.interface';
import { CellEditConfig } from './cell-edit-config.interface';

describe('ColumnDefinition Interface', () => {
  describe('Type Structure', () => {
    it('should allow a minimal valid column definition', () => {
      const column: ColumnDefinition = {
        key: 'id',
        title: 'ID',
        type: 'text',
      };

      expect(column.key).toBe('id');
      expect(column.title).toBe('ID');
      expect(column.type).toBe('text');
    });

    it('should allow a complete column definition with all optional properties', () => {
      const editConfig: CellEditConfig = {
        type: 'text',
        required: true,
      };

      const column: ColumnDefinition = {
        key: 'name',
        title: 'Full Name',
        type: 'text',
        width: 200,
        minWidth: 100,
        maxWidth: 300,
        resizable: true,
        sortable: true,
        filterable: true,
        visible: true,
        sortDirection: 'asc',
        filterValue: 'test',
        cssClass: 'custom-column',
        headerCssClass: 'custom-header',
        cellCssClass: 'custom-cell',
        editable: true,
        editConfig: editConfig,
        formatter: (value: any) => String(value),
        validator: (value: any) => value != null,
      };

      expect(column.key).toBe('name');
      expect(column.title).toBe('Full Name');
      expect(column.type).toBe('text');
      expect(column.width).toBe(200);
      expect(column.minWidth).toBe(100);
      expect(column.maxWidth).toBe(300);
      expect(column.resizable).toBe(true);
      expect(column.sortable).toBe(true);
      expect(column.filterable).toBe(true);
      expect(column.visible).toBe(true);
      expect(column.sortDirection).toBe('asc');
      expect(column.filterValue).toBe('test');
      expect(column.cssClass).toBe('custom-column');
      expect(column.editable).toBe(true);
      expect(column.editConfig).toBe(editConfig);
      expect(typeof column.formatter).toBe('function');
      expect(typeof column.validator).toBe('function');
    });
  });

  describe('Required Properties', () => {
    it('should require key property', () => {
      const column: ColumnDefinition = {
        key: 'required-key',
        title: 'Title',
        type: 'text',
      };

      expect(column.key).toBeDefined();
      expect(typeof column.key).toBe('string');
    });

    it('should require title property', () => {
      const column: ColumnDefinition = {
        key: 'test',
        title: 'Required Title',
        type: 'text',
      };

      expect(column.title).toBeDefined();
      expect(typeof column.title).toBe('string');
    });

    it('should require type property', () => {
      const column: ColumnDefinition = {
        key: 'test',
        title: 'Title',
        type: 'number',
      };

      expect(column.type).toBeDefined();
      expect(typeof column.type).toBe('string');
    });
  });

  describe('Column Types', () => {
    it('should support all column types', () => {
      const textColumn: ColumnDefinition = {
        key: 'text',
        title: 'Text',
        type: 'text',
      };
      const numberColumn: ColumnDefinition = {
        key: 'num',
        title: 'Number',
        type: 'number',
      };
      const dateColumn: ColumnDefinition = {
        key: 'date',
        title: 'Date',
        type: 'date',
      };
      const booleanColumn: ColumnDefinition = {
        key: 'bool',
        title: 'Boolean',
        type: 'boolean',
      };
      const selectColumn: ColumnDefinition = {
        key: 'select',
        title: 'Select',
        type: 'select',
      };
      const customColumn: ColumnDefinition = {
        key: 'custom',
        title: 'Custom',
        type: 'custom',
      };

      expect(textColumn.type).toBe('text');
      expect(numberColumn.type).toBe('number');
      expect(dateColumn.type).toBe('date');
      expect(booleanColumn.type).toBe('boolean');
      expect(selectColumn.type).toBe('select');
      expect(customColumn.type).toBe('custom');
    });
  });

  describe('Sort Direction', () => {
    it('should support sort directions', () => {
      const ascColumn: ColumnDefinition = {
        key: 'asc',
        title: 'Ascending',
        type: 'text',
        sortDirection: 'asc',
      };

      const descColumn: ColumnDefinition = {
        key: 'desc',
        title: 'Descending',
        type: 'text',
        sortDirection: 'desc',
      };

      const noneColumn: ColumnDefinition = {
        key: 'none',
        title: 'No Sort',
        type: 'text',
        sortDirection: 'none',
      };

      expect(ascColumn.sortDirection).toBe('asc');
      expect(descColumn.sortDirection).toBe('desc');
      expect(noneColumn.sortDirection).toBe('none');
    });
  });

  describe('Function Properties', () => {
    it('should allow formatter function', () => {
      const formatter = (value: any): string => {
        return value ? value.toString().toUpperCase() : '';
      };

      const column: ColumnDefinition = {
        key: 'formatted',
        title: 'Formatted',
        type: 'text',
        formatter: formatter,
      };

      expect(column.formatter).toBe(formatter);
      expect(column.formatter!('test')).toBe('TEST');
    });

    it('should allow validator function', () => {
      const validator = (value: any): boolean => {
        return value != null && value.toString().length > 0;
      };

      const column: ColumnDefinition = {
        key: 'validated',
        title: 'Validated',
        type: 'text',
        validator: validator,
      };

      expect(column.validator).toBe(validator);
      expect(column.validator!('test')).toBe(true);
      expect(column.validator!('')).toBe(false);
    });
  });

  describe('Validation Logic', () => {
    it('should validate key is not empty', () => {
      const isValidKey = (key: string): boolean => {
        return key.length > 0 && key.trim().length > 0;
      };

      expect(isValidKey('valid-key')).toBe(true);
      expect(isValidKey('')).toBe(false);
      expect(isValidKey('   ')).toBe(false);
    });

    it('should validate width constraints', () => {
      const isValidWidthConstraints = (
        column: Partial<ColumnDefinition>
      ): boolean => {
        const { width, minWidth, maxWidth } = column;

        if (minWidth && width && width < minWidth) return false;
        if (maxWidth && width && width > maxWidth) return false;
        if (minWidth && maxWidth && minWidth > maxWidth) return false;

        return true;
      };

      expect(
        isValidWidthConstraints({ width: 150, minWidth: 100, maxWidth: 200 })
      ).toBe(true);
      expect(isValidWidthConstraints({ width: 50, minWidth: 100 })).toBe(false);
      expect(isValidWidthConstraints({ width: 250, maxWidth: 200 })).toBe(
        false
      );
      expect(isValidWidthConstraints({ minWidth: 200, maxWidth: 100 })).toBe(
        false
      );
    });
  });
});
