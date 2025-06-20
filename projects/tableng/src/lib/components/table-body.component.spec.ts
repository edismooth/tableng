import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableBodyComponent } from './table-body.component';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { TableConfig } from '../interfaces/table-config.interface';

// TableConfig now includes selectable and editable properties

describe('TableBodyComponent', () => {
  let component: TableBodyComponent;
  let fixture: ComponentFixture<TableBodyComponent>;

  const mockColumns: ColumnDefinition[] = [
    { 
      key: 'id', 
      title: 'ID', 
      type: 'number', 
      width: 80 
    },
    { 
      key: 'name', 
      title: 'Name', 
      type: 'text', 
      width: 200 
    },
    { 
      key: 'email', 
      title: 'Email', 
      type: 'text', 
      width: 250 
    },
    { 
      key: 'active', 
      title: 'Active', 
      type: 'boolean', 
      width: 100 
    },
    {
      key: 'created',
      title: 'Created',
      type: 'date',
      width: 150
    }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true, created: new Date('2023-01-01') },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false, created: new Date('2023-02-01') },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true, created: new Date('2023-03-01') },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', active: true, created: new Date('2023-04-01') },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', active: false, created: new Date('2023-05-01') }
  ];

  const mockConfig: TableConfig = {
    tableId: 'test-table',
    columns: mockColumns,
    virtualScrolling: false,
    stickyHeaders: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableBodyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableBodyComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.columns = mockColumns;
    component.data = mockData;
    component.config = mockConfig;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties', () => {
      expect(component.columns).toBeDefined();
      expect(component.data).toBeDefined();
      expect(component.config).toBeDefined();
      expect(component.loading).toBe(false);
      expect(component.selectedRows).toEqual([]);
    });

    it('should have required output events', () => {
      expect(component.rowClick).toBeDefined();
      expect(component.rowSelect).toBeDefined();
      expect(component.cellEdit).toBeDefined();
      expect(component.cellChange).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render table body container', () => {
      const bodyContainer = fixture.debugElement.query(By.css('.tableng-body'));
      expect(bodyContainer).toBeTruthy();
    });

    it('should render all data rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('.tableng-row'));
      expect(rows.length).toBe(mockData.length);
    });

    it('should render all cells for each row', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const cells = firstRow.queryAll(By.css('.tableng-cell'));
      expect(cells.length).toBe(mockColumns.length);
    });

    it('should display cell data correctly for different types', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const cells = firstRow.queryAll(By.css('.tableng-cell'));
      
      // Number cell
      expect(cells[0].nativeElement.textContent.trim()).toBe('1');
      
      // Text cell
      expect(cells[1].nativeElement.textContent.trim()).toBe('John Doe');
      
      // Boolean cell should show formatted value
      expect(cells[3].nativeElement.textContent.trim()).toContain('Yes');
    });

    it('should apply column widths to cells', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const cells = firstRow.queryAll(By.css('.tableng-cell'));
      
      cells.forEach((cell, index) => {
        const expectedWidth = mockColumns[index].width;
        if (expectedWidth) {
          expect(cell.nativeElement.style.width).toBe(`${expectedWidth}px`);
        }
      });
    });

    it('should apply column-specific CSS classes', () => {
      const testColumn: ColumnDefinition = {
        ...mockColumns[0],
        cssClass: 'custom-column',
        cellCssClass: 'custom-cell'
      };
      component.columns = [testColumn];
      fixture.detectChanges();

      const cell = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cell.nativeElement.classList).toContain('custom-column');
      expect(cell.nativeElement.classList).toContain('custom-cell');
    });
  });

  describe('Data Formatting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should format boolean values correctly', () => {
      const rows = fixture.debugElement.queryAll(By.css('.tableng-row'));
      const activeCell = rows[0].queryAll(By.css('.tableng-cell'))[3];
      expect(activeCell.nativeElement.textContent.trim()).toBe('Yes');

      const inactiveCell = rows[1].queryAll(By.css('.tableng-cell'))[3];
      expect(inactiveCell.nativeElement.textContent.trim()).toBe('No');
    });

    it('should format date values correctly', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const dateCell = firstRow.queryAll(By.css('.tableng-cell'))[4];
      const formattedDate = dateCell.nativeElement.textContent.trim();
      expect(formattedDate).toContain('2023');
    });

    it('should handle null and undefined values gracefully', () => {
      const dataWithNulls = [
        { id: 1, name: null, email: undefined, active: true, created: null }
      ];
      component.data = dataWithNulls;
      fixture.detectChanges();

      const cells = fixture.debugElement.queryAll(By.css('.tableng-cell'));
      expect(cells[1].nativeElement.textContent.trim()).toBe('');
      expect(cells[2].nativeElement.textContent.trim()).toBe('');
      expect(cells[4].nativeElement.textContent.trim()).toBe('');
    });

    it('should use custom formatter when provided', () => {
      const columnWithFormatter: ColumnDefinition = {
        ...mockColumns[1],
        formatter: (value: unknown) => typeof value === 'string' && value ? value.toUpperCase() : ''
      };
      component.columns = [mockColumns[0], columnWithFormatter, ...mockColumns.slice(2)];
      fixture.detectChanges();

      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const nameCell = firstRow.queryAll(By.css('.tableng-cell'))[1];
      expect(nameCell.nativeElement.textContent.trim()).toBe('JOHN DOE');
    });
  });

  describe('Row Selection', () => {
    beforeEach(() => {
      component.config = { ...mockConfig, selectable: true };
      fixture.detectChanges();
    });

    it('should show selection checkbox when selectable is enabled', () => {
      const checkboxes = fixture.debugElement.queryAll(By.css('.tableng-selection-checkbox'));
      expect(checkboxes.length).toBe(mockData.length);
    });

    it('should emit rowSelect event when checkbox is clicked', () => {
      let emittedSelectData: unknown;
      component.rowSelect.subscribe((data: unknown) => emittedSelectData = data);

      const firstCheckbox = fixture.debugElement.query(By.css('.tableng-selection-checkbox'));
      firstCheckbox.triggerEventHandler('change', { target: { checked: true } });

      expect(emittedSelectData).toBeDefined();
    });

    it('should apply selected row styling', () => {
      component.selectedRows = [mockData[0]];
      fixture.detectChanges();

      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      expect(firstRow.nativeElement.classList).toContain('tableng-row-selected');
    });

    it('should handle multiple row selection', () => {
      component.selectedRows = [mockData[0], mockData[2]];
      fixture.detectChanges();

      const selectedRows = fixture.debugElement.queryAll(By.css('.tableng-row-selected'));
      expect(selectedRows.length).toBe(2);
    });
  });

  describe('Row Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit rowClick event when row is clicked', () => {
      let emittedRowData: unknown;
      component.rowClick.subscribe((data: unknown) => emittedRowData = data);

      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      firstRow.triggerEventHandler('click', null);

      expect(emittedRowData).toBe(mockData[0]);
    });

    it('should apply hover styles on mouse over', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const mockEvent = { target: firstRow.nativeElement } as Event;
      
      firstRow.triggerEventHandler('mouseenter', mockEvent);
      fixture.detectChanges();
      
      expect(firstRow.nativeElement.classList).toContain('tableng-row-hover');
    });

    it('should remove hover styles on mouse leave', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const mockEnterEvent = { target: firstRow.nativeElement } as Event;
      const mockLeaveEvent = { target: firstRow.nativeElement } as Event;
      
      firstRow.triggerEventHandler('mouseenter', mockEnterEvent);
      fixture.detectChanges();
      expect(firstRow.nativeElement.classList).toContain('tableng-row-hover');
      
      firstRow.triggerEventHandler('mouseleave', mockLeaveEvent);
      fixture.detectChanges();
      expect(firstRow.nativeElement.classList).not.toContain('tableng-row-hover');
    });
  });

  describe('Cell Editing', () => {
    beforeEach(() => {
      component.config = { ...mockConfig, editable: true };
      component.columns = mockColumns.map(col => ({ ...col, editable: true }));
      fixture.detectChanges();
    });

    it('should show edit indicator for editable cells', () => {
      const editableCells = fixture.debugElement.queryAll(By.css('.tableng-cell-editable'));
      expect(editableCells.length).toBeGreaterThan(0);
    });

    it('should emit cellEdit event when cell is double-clicked', () => {
      let emittedCellData: unknown;
      component.cellEdit.subscribe((data: unknown) => emittedCellData = data);

      const firstCell = fixture.debugElement.query(By.css('.tableng-cell'));
      firstCell.triggerEventHandler('dblclick', null);

      expect(emittedCellData).toBeDefined();
    });

    it('should handle cell value changes', () => {
      let emittedChangeData: unknown;
      component.cellChange.subscribe((data: unknown) => emittedChangeData = data);

      const changeData = { 
        rowIndex: 0, 
        column: 'name', 
        oldValue: 'John Doe', 
        newValue: 'John Smith' 
      };
      component.onCellChange(changeData);

      expect(emittedChangeData).toBe(changeData);
    });
  });

  describe('Virtual Scrolling', () => {
    beforeEach(() => {
      component.config = { ...mockConfig, virtualScrolling: true };
      component.virtualScrollConfig = {
        enabled: true,
        itemHeight: 40,
        viewportHeight: 200,
        startIndex: 0,
        endIndex: 5
      };
      fixture.detectChanges();
    });

    it('should apply virtual scrolling container when enabled', () => {
      const virtualContainer = fixture.debugElement.query(By.css('.tableng-virtual-scroll-container'));
      expect(virtualContainer).toBeTruthy();
    });

    it('should render only visible rows in virtual scroll mode', () => {
      const rows = fixture.debugElement.queryAll(By.css('.tableng-row'));
      expect(rows.length).toBeLessThanOrEqual(6); // endIndex - startIndex + buffer
    });

    it('should calculate correct scroll height for virtual scrolling', () => {
      const scrollHeight = component.getVirtualScrollHeight();
      expect(scrollHeight).toBe(mockData.length * 40); // itemHeight * total items
    });

    it('should update visible range on scroll', () => {
      const mockScrollEvent = {
        target: { scrollTop: 80 }
      } as unknown as Event;
      
      component.onScroll(mockScrollEvent);

      expect(component.virtualScrollConfig?.startIndex).toBeGreaterThan(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.tableng-loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should hide data rows when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.tableng-row'));
      expect(rows.length).toBe(0);
    });

    it('should show loading spinner with proper styling', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.tableng-loading-spinner'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no data is provided', () => {
      component.data = [];
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('.tableng-empty'));
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.nativeElement.textContent).toContain('No data available');
    });

    it('should show custom empty message when provided', () => {
      component.data = [];
      component.emptyMessage = 'Custom empty message';
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('.tableng-empty'));
      expect(emptyMessage.nativeElement.textContent).toContain('Custom empty message');
    });

    it('should not show empty message when loading', () => {
      component.data = [];
      component.loading = true;
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('.tableng-empty'));
      expect(emptyMessage).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes for table structure', () => {
      const body = fixture.debugElement.query(By.css('.tableng-body'));
      expect(body.nativeElement.getAttribute('role')).toBe('rowgroup');
    });

    it('should have proper row ARIA attributes', () => {
      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      expect(firstRow.nativeElement.getAttribute('role')).toBe('row');
      expect(firstRow.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper cell ARIA attributes', () => {
      const firstCell = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(firstCell.nativeElement.getAttribute('role')).toBe('gridcell');
    });

    it('should support keyboard navigation for rows', () => {
      let emittedRowData: unknown;
      component.rowClick.subscribe((data: unknown) => emittedRowData = data);

      const firstRow = fixture.debugElement.query(By.css('.tableng-row'));
      const mockKeyEvent = {
        key: 'Enter',
        preventDefault: () => { /* Mock preventDefault */ }
      } as unknown as KeyboardEvent;
      
      firstRow.triggerEventHandler('keydown', mockKeyEvent);

      expect(emittedRowData).toBe(mockData[0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty columns array gracefully', () => {
      component.columns = [];
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle null data gracefully', () => {
      component.data = null as unknown as unknown[];
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      const emptyMessage = fixture.debugElement.query(By.css('.tableng-empty'));
      expect(emptyMessage).toBeTruthy();
    });

    it('should handle data items with missing properties', () => {
      const incompleteData = [
        { id: 1, name: 'John' }, // missing email, active, created
        { email: 'jane@example.com' } // missing other properties
      ];
      component.data = incompleteData;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle invalid date values', () => {
      const dataWithInvalidDate = [
        { id: 1, name: 'John', email: 'john@example.com', active: true, created: 'invalid-date' }
      ];
      component.data = dataWithInvalidDate;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
}); 