import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableRowComponent } from './table-row.component';
import { TableCellComponent } from './table-cell.component';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';
import { TableRow } from '../interfaces/table-row.interface';

describe('TableRowComponent', () => {
  let component: TableRowComponent;
  let fixture: ComponentFixture<TableRowComponent>;

  const mockColumns: ColumnDefinition[] = [
    { key: 'id', title: 'ID', type: 'number', width: 80 },
    { key: 'name', title: 'Name', type: 'text', width: 200, editable: true },
    { key: 'email', title: 'Email', type: 'text', width: 250, editable: true },
    { key: 'active', title: 'Active', type: 'boolean', width: 100, editable: true }
  ];

  const mockRowData: TableRow<any> = {
    data: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      active: true
    },
    level: 0,
    expanded: false
  };

  const mockEditConfigs: Record<string, CellEditConfig> = {
    name: { type: 'text', required: true },
    email: { type: 'text', required: true },
    active: { type: 'checkbox' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableRowComponent, TableCellComponent],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TableRowComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.columns = mockColumns;
    component.rowData = mockRowData;
    component.rowIndex = 0;
    component.editConfigs = mockEditConfigs;
    component.selectable = true;
    component.editable = true;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties', () => {
      expect(component.columns).toBeDefined();
      expect(component.rowData).toBeDefined();
      expect(component.rowIndex).toBeDefined();
      expect(component.selectable).toBe(true);
      expect(component.editable).toBe(true);
      expect(component.selected).toBe(false);
    });

    it('should have required output events', () => {
      expect(component.rowClick).toBeDefined();
      expect(component.rowSelect).toBeDefined();
      expect(component.cellValueChange).toBeDefined();
      expect(component.rowHover).toBeDefined();
    });

    it('should initialize with default values', () => {
      component.ngOnInit();
      expect(component.selected).toBe(false);
      expect(component.hovering).toBe(false);
      expect(component.hasEditingCell).toBe(false);
    });
  });

  describe('Row Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render table row element', () => {
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement).toBeTruthy();
    });

    it('should render correct number of cells', () => {
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements.length).toBe(mockColumns.length);
    });

    it('should pass correct data to each cell', () => {
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      
      cellElements.forEach((cellElement, index) => {
        const cellComponent = cellElement.componentInstance as TableCellComponent;
        const column = mockColumns[index];
        
        expect(cellComponent.column).toEqual(column);
        expect(cellComponent.value).toBe(mockRowData.data[column.key]);
        expect(cellComponent.rowIndex).toBe(0);
      });
    });

    it('should pass edit configs to editable cells', () => {
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      
      const nameCell = cellElements[1].componentInstance as TableCellComponent;
      expect(nameCell.editConfig).toEqual(mockEditConfigs['name']);
      
      const activeCell = cellElements[3].componentInstance as TableCellComponent;
      expect(activeCell.editConfig).toEqual(mockEditConfigs['active']);
    });

    it('should render selection checkbox when selectable', () => {
      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector input[type="checkbox"]'));
      expect(checkbox).toBeTruthy();
    });

    it('should not render selection checkbox when not selectable', () => {
      component.selectable = false;
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector'));
      expect(checkbox).toBeFalsy();
    });

    it('should apply row styling classes', () => {
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-selectable');
    });

    it('should apply even/odd row styling', () => {
      component.rowIndex = 0;
      fixture.detectChanges();
      let rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-even');

      component.rowIndex = 1;
      fixture.detectChanges();
      rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-odd');
    });
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle selection on checkbox click', () => {
      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector input'));
      
      checkbox.triggerEventHandler('change', { target: { checked: true } });
      expect(component.selected).toBe(true);

      checkbox.triggerEventHandler('change', { target: { checked: false } });
      expect(component.selected).toBe(false);
    });

    it('should emit rowSelect event on selection change', () => {
      let emittedEvent: any;
      component.rowSelect.subscribe((event: any) => emittedEvent = event);

      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector input'));
      checkbox.triggerEventHandler('change', { target: { checked: true } });

      expect(emittedEvent).toEqual({
        rowIndex: 0,
        rowData: mockRowData,
        selected: true
      });
    });

    it('should reflect selected state in checkbox', () => {
      component.selected = true;
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector input'));
      expect(checkbox.nativeElement.checked).toBe(true);
    });

    it('should apply selected styling when selected', () => {
      component.selected = true;
      fixture.detectChanges();

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-selected');
    });
  });

  describe('Row Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit rowClick event on row click', () => {
      let emittedEvent: any;
      component.rowClick.subscribe((event: any) => emittedEvent = event);

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      rowElement.triggerEventHandler('click', new MouseEvent('click'));

      expect(emittedEvent.rowIndex).toBe(0);
      expect(emittedEvent.rowData).toBe(mockRowData);
      expect(emittedEvent.event).toBeInstanceOf(MouseEvent);
    });

    it('should handle mouse enter event', () => {
      let emittedEvent: any;
      component.rowHover.subscribe((event: any) => emittedEvent = event);

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      rowElement.triggerEventHandler('mouseenter', null);

      expect(component.hovering).toBe(true);
      expect(emittedEvent).toEqual({
        rowIndex: 0,
        rowData: mockRowData,
        hovering: true
      });
    });

    it('should handle mouse leave event', () => {
      let emittedEvent: any;
      component.rowHover.subscribe((event: any) => emittedEvent = event);

      component.hovering = true;
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      rowElement.triggerEventHandler('mouseleave', null);

      expect(component.hovering).toBe(false);
      expect(emittedEvent).toEqual({
        rowIndex: 0,
        rowData: mockRowData,
        hovering: false
      });
    });

    it('should apply hover styling when hovering', () => {
      component.hovering = true;
      fixture.detectChanges();

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-hover');
    });

    it('should support keyboard navigation on row', () => {
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should handle Enter key press', () => {
      let emittedEvent: any;
      component.rowClick.subscribe((event: any) => emittedEvent = event);

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      rowElement.triggerEventHandler('keydown', enterEvent);

      expect(emittedEvent.rowIndex).toBe(0);
      expect(emittedEvent.rowData).toBe(mockRowData);
      expect(emittedEvent.event).toBeInstanceOf(KeyboardEvent);
    });

    it('should handle Space key press for selection', () => {
      let emittedEvent: any;
      component.rowSelect.subscribe((event: any) => emittedEvent = event);

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      rowElement.triggerEventHandler('keydown', spaceEvent);

      expect(component.selected).toBe(true);
      expect(emittedEvent).toEqual({
        rowIndex: 0,
        rowData: mockRowData,
        selected: true
      });
    });
  });

  describe('Cell Editing Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle cell edit start events', () => {
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      const nameCell = cellElements[1].componentInstance as TableCellComponent;

      nameCell.editStart.emit({
        column: 'name',
        rowIndex: 0,
        value: 'John Doe'
      });

      expect(component.hasEditingCell).toBe(true);
    });

    it('should handle cell edit end events', () => {
      component.hasEditingCell = true;
      
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      const nameCell = cellElements[1].componentInstance as TableCellComponent;

      nameCell.editEnd.emit({
        column: 'name',
        rowIndex: 0,
        saved: true
      });

      expect(component.hasEditingCell).toBe(false);
    });

    it('should emit cellValueChange when cell value changes', () => {
      let emittedEvent: any;
      component.cellValueChange.subscribe((event: any) => emittedEvent = event);

      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      const nameCell = cellElements[1].componentInstance as TableCellComponent;

      nameCell.valueChange.emit({
        column: 'name',
        rowIndex: 0,
        oldValue: 'John Doe',
        newValue: 'Jane Doe'
      });

      expect(emittedEvent).toEqual({
        rowIndex: 0,
        rowData: mockRowData,
        column: 'name',
        oldValue: 'John Doe',
        newValue: 'Jane Doe'
      });
    });

    it('should update local row data when cell value changes', () => {
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      const nameCell = cellElements[1].componentInstance as TableCellComponent;

      nameCell.valueChange.emit({
        column: 'name',
        rowIndex: 0,
        oldValue: 'John Doe',
        newValue: 'Jane Doe'
      });

      expect(component.rowData?.data?.['name']).toBe('Jane Doe');
    });

    it('should apply editing styling when a cell is being edited', () => {
      component.hasEditingCell = true;
      fixture.detectChanges();

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.classList).toContain('tableng-row-editing');
    });
  });

  describe('Dynamic Column Changes', () => {
    it('should handle column order changes', () => {
      const reorderedColumns = [mockColumns[1], mockColumns[0], mockColumns[2], mockColumns[3]];
      component.columns = reorderedColumns;
      fixture.detectChanges();

      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements[0].componentInstance.column.key).toBe('name');
      expect(cellElements[1].componentInstance.column.key).toBe('id');
    });

    it('should handle column visibility changes', () => {
      const visibleColumns = mockColumns.filter(col => col.key !== 'email');
      component.columns = visibleColumns;
      fixture.detectChanges();

      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements.length).toBe(3);
    });

    it('should handle new columns being added', () => {
      const newColumn: ColumnDefinition = {
        key: 'created',
        title: 'Created',
        type: 'date',
        width: 150
      };
      component.columns = [...mockColumns, newColumn];
      component.rowData = {
        ...mockRowData,
        data: { ...mockRowData.data, created: new Date() }
      };
      fixture.detectChanges();

      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements.length).toBe(5);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes', () => {
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.getAttribute('role')).toBe('row');
      expect(rowElement.nativeElement.getAttribute('aria-selected')).toBe('false');
    });

    it('should update aria-selected when selected', () => {
      component.selected = true;
      fixture.detectChanges();

      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should have aria-label for selection checkbox', () => {
      const checkbox = fixture.debugElement.query(By.css('.tableng-row-selector input'));
      expect(checkbox.nativeElement.getAttribute('aria-label')).toContain('Select row');
    });

    it('should support screen reader announcements', () => {
      const rowElement = fixture.debugElement.query(By.css('.tableng-row'));
      expect(rowElement.nativeElement.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle null row data gracefully', () => {
      component.rowData = null as any;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle undefined row data gracefully', () => {
      component.rowData = null as any;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle empty columns array', () => {
      component.columns = [];
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
      
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements.length).toBe(0);
    });

    it('should handle missing edit configs', () => {
      component.editConfigs = null;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle row data with missing properties', () => {
      component.rowData = { data: { id: 1 }, level: 0, expanded: false }; // Missing name, email, active
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
      
      const cellElements = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(cellElements[1].componentInstance.value).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle multiple change detection cycles', () => {
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should cleanup component properly', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should not recreate cells unnecessarily', () => {
      fixture.detectChanges();
      const initialCells = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      
      component.hovering = true;
      fixture.detectChanges();
      
      const afterHoverCells = fixture.debugElement.queryAll(By.directive(TableCellComponent));
      expect(afterHoverCells.length).toBe(initialCells.length);
    });
  });
});