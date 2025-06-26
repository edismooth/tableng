import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableHeaderComponent } from './table-header.component';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { TableConfig } from '../interfaces/table-config.interface';

describe('TableHeaderComponent', () => {
  let component: TableHeaderComponent;
  let fixture: ComponentFixture<TableHeaderComponent>;

  const mockColumns: ColumnDefinition[] = [
    { 
      key: 'id', 
      title: 'ID', 
      type: 'number', 
      width: 80, 
      sortable: true,
      resizable: true 
    },
    { 
      key: 'name', 
      title: 'Name', 
      type: 'text', 
      width: 200, 
      sortable: true, 
      filterable: true,
      resizable: true 
    },
    { 
      key: 'email', 
      title: 'Email', 
      type: 'text', 
      width: 250, 
      filterable: true,
      resizable: false 
    },
    { 
      key: 'active', 
      title: 'Active', 
      type: 'boolean', 
      width: 100,
      sortable: false 
    }
  ];

  const mockConfig: TableConfig = {
    tableId: 'test-table',
    columns: mockColumns,
    sorting: true,
    filtering: true,
    resizable: true,
    reorderable: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHeaderComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.columns = mockColumns;
    component.config = mockConfig;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties', () => {
      expect(component.columns).toBeDefined();
      expect(component.config).toBeDefined();
      expect(component.sortState).toBeUndefined();
      expect(component.stickyHeader).toBe(false);
    });

    it('should have required output events', () => {
      expect(component.sortChange).toBeDefined();
      expect(component.filterChange).toBeDefined();
      expect(component.columnResize).toBeDefined();
      expect(component.columnReorder).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render header container', () => {
      const headerContainer = fixture.debugElement.query(By.css('.tableng-header'));
      expect(headerContainer).toBeTruthy();
    });

    it('should render all column headers', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('.tableng-header-cell'));
      expect(headerCells.length).toBe(mockColumns.length);
    });

    it('should display column titles correctly', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('.tableng-header-cell-title'));
      
      headerCells.forEach((cell, index) => {
        expect(cell.nativeElement.textContent.trim()).toBe(mockColumns[index].title);
      });
    });

    it('should apply sticky header class when enabled', () => {
      component.stickyHeader = true;
      fixture.detectChanges();

      const headerContainer = fixture.debugElement.query(By.css('.tableng-header'));
      expect(headerContainer.nativeElement.classList).toContain('tableng-sticky-header');
    });

    it('should apply column-specific CSS classes', () => {
      const testColumn: ColumnDefinition = {
        ...mockColumns[0],
        cssClass: 'custom-column',
        headerCssClass: 'custom-header'
      };
      component.columns = [testColumn];
      fixture.detectChanges();

      const headerCell = fixture.debugElement.query(By.css('.tableng-header-cell'));
      expect(headerCell.nativeElement.classList).toContain('custom-column');
      expect(headerCell.nativeElement.classList).toContain('custom-header');
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show sort indicator for sortable columns', () => {
      const sortableHeaders = fixture.debugElement.queryAll(By.css('.tableng-sortable'));
      expect(sortableHeaders.length).toBe(2); // id and name columns are sortable
    });

    it('should not show sort indicator for non-sortable columns', () => {
      const nonSortableHeader = fixture.debugElement.queryAll(By.css('.tableng-header-cell'))[3]; // active column
      const sortIcon = nonSortableHeader.query(By.css('.tableng-sort-icon'));
      expect(sortIcon).toBeFalsy();
    });

    it('should emit sortChange event when clicking sortable column', () => {
      let emittedSortData: any;
      component.sortChange.subscribe((data: any) => emittedSortData = data);

      const sortableHeader = fixture.debugElement.query(By.css('.tableng-sortable'));
      sortableHeader.triggerEventHandler('click', null);

      expect(emittedSortData).toBeDefined();
      expect(emittedSortData.column).toBe('id');
      expect(emittedSortData.direction).toBe('asc');
    });

    it('should cycle through sort directions on multiple clicks', () => {
      const sortData: any[] = [];
      component.sortChange.subscribe((data: any) => sortData.push(data));

      const sortableHeader = fixture.debugElement.query(By.css('.tableng-sortable'));
      
      // First click: asc
      sortableHeader.triggerEventHandler('click', null);
      expect(sortData[0].direction).toBe('asc');

      // Second click: desc
      component.onColumnSort('id');
      sortableHeader.triggerEventHandler('click', null);
      expect(sortData[1].direction).toBe('desc');

      // Third click: none (clear sort)
      component.onColumnSort('id');
      sortableHeader.triggerEventHandler('click', null);
      expect(sortData[2].direction).toBe('none');
    });

    it('should display current sort state visually', () => {
      component.sortState = { column: 'name', direction: 'asc' };
      fixture.detectChanges();

      const nameHeader = fixture.debugElement.queryAll(By.css('.tableng-header-cell'))[1];
      const sortIcon = nameHeader.query(By.css('.tableng-sort-icon'));
      
      expect(nameHeader.nativeElement.classList).toContain('tableng-sorted-asc');
      expect(sortIcon).toBeTruthy();
    });
  });

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show filter input for filterable columns', () => {
      const filterInputs = fixture.debugElement.queryAll(By.css('.tableng-filter-input'));
      expect(filterInputs.length).toBe(2); // name and email columns are filterable
    });

    it('should not show filter input for non-filterable columns', () => {
      const idHeader = fixture.debugElement.queryAll(By.css('.tableng-header-cell'))[0];
      const filterInput = idHeader.query(By.css('.tableng-filter-input'));
      expect(filterInput).toBeFalsy();
    });

    it('should emit filterChange event when filter input changes', () => {
      let emittedFilterData: any;
      component.filterChange.subscribe((data: any) => emittedFilterData = data);

      const filterInput = fixture.debugElement.query(By.css('.tableng-filter-input'));
      filterInput.nativeElement.value = 'test filter';
      filterInput.triggerEventHandler('input', { target: { value: 'test filter' } });

      expect(emittedFilterData).toBeDefined();
      expect(emittedFilterData.column).toBe('name');
      expect(emittedFilterData.value).toBe('test filter');
    });

    it('should clear filter when input is emptied', () => {
      let emittedFilterData: any;
      component.filterChange.subscribe((data: any) => emittedFilterData = data);

      const filterInput = fixture.debugElement.query(By.css('.tableng-filter-input'));
      filterInput.nativeElement.value = '';
      filterInput.triggerEventHandler('input', { target: { value: '' } });

      expect(emittedFilterData.value).toBe('');
    });
  });

  describe('Column Resizing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show resize handle for resizable columns', () => {
      const resizeHandles = fixture.debugElement.queryAll(By.css('.tableng-resize-handle'));
      expect(resizeHandles.length).toBe(2); // id, name columns are resizable (email and active are not)
    });

    it('should not show resize handle for non-resizable columns', () => {
      const emailHeader = fixture.debugElement.queryAll(By.css('.tableng-header-cell'))[2];
      const resizeHandle = emailHeader.query(By.css('.tableng-resize-handle'));
      expect(resizeHandle).toBeFalsy();
    });

    it('should emit columnResize event when resizing', () => {
      let emittedResizeData: any;
      component.columnResize.subscribe((data: any) => emittedResizeData = data);

      const resizeData = { column: 'name', width: 250 };
      component.onColumnResize(resizeData);

      expect(emittedResizeData).toBe(resizeData);
    });

    it('should apply column widths from configuration', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('.tableng-header-cell'));
      
      headerCells.forEach((cell, index) => {
        const expectedWidth = mockColumns[index].width;
        if (expectedWidth) {
          expect(cell.nativeElement.style.width).toBe(`${expectedWidth}px`);
        }
      });
    });
  });

  describe('Column Reordering', () => {
    beforeEach(() => {
      component.config = { ...mockConfig, reorderable: true };
      fixture.detectChanges();
    });

    it('should make headers draggable when reordering enabled', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('.tableng-header-cell'));
      
      headerCells.forEach(cell => {
        expect(cell.nativeElement.draggable).toBe(true);
      });
    });

    it('should emit columnReorder event when reordering', () => {
      let emittedReorderData: any;
      component.columnReorder.subscribe((data: any) => emittedReorderData = data);

      const reorderData = { fromIndex: 0, toIndex: 1 };
      component.onColumnReorder(reorderData);

      expect(emittedReorderData).toBe(reorderData);
    });

    it('should apply visual feedback during drag operations', () => {
      const headerCell = fixture.debugElement.query(By.css('.tableng-header-cell'));
      
      // Start drag
      headerCell.triggerEventHandler('dragstart', { target: headerCell.nativeElement });
      fixture.detectChanges();
      
      expect(headerCell.nativeElement.classList).toContain('tableng-dragging');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes for sorting', () => {
      const sortableHeader = fixture.debugElement.query(By.css('.tableng-sortable'));
      
      expect(sortableHeader.nativeElement.getAttribute('role')).toBe('columnheader');
      expect(sortableHeader.nativeElement.getAttribute('aria-sort')).toBeTruthy();
      expect(sortableHeader.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper labels for filter inputs', () => {
      const filterInput = fixture.debugElement.query(By.css('.tableng-filter-input'));
      
      expect(filterInput.nativeElement.getAttribute('aria-label')).toContain('Filter');
      expect(filterInput.nativeElement.getAttribute('placeholder')).toBeTruthy();
    });

    it('should support keyboard navigation for sorting', () => {
      let emittedSortData: any;
      component.sortChange.subscribe((data: any) => emittedSortData = data);

      const sortableHeader = fixture.debugElement.query(By.css('.tableng-sortable'));
      
      // Simulate Enter key press
      sortableHeader.triggerEventHandler('keydown', { key: 'Enter', preventDefault: () => { /* prevent default */ } });
      
      expect(emittedSortData).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty columns array gracefully', () => {
      component.columns = [];
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      const headerCells = fixture.debugElement.queryAll(By.css('.tableng-header-cell'));
      expect(headerCells.length).toBe(0);
    });

    it('should handle null config gracefully', () => {
      component.config = null as any;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle columns without width specified', () => {
      const columnsWithoutWidth = mockColumns.map(col => ({ ...col, width: undefined }));
      component.columns = columnsWithoutWidth;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
}); 