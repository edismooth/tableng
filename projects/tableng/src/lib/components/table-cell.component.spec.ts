import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableCellComponent } from './table-cell.component';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

describe('TableCellComponent', () => {
  let component: TableCellComponent;
  let fixture: ComponentFixture<TableCellComponent>;

  const mockColumn: ColumnDefinition = {
    key: 'name',
    title: 'Name',
    type: 'text',
    width: 200,
    editable: true
  };

  const mockEditConfig: CellEditConfig = {
    type: 'text',
    required: false,
    disabled: false,
    readonly: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableCellComponent],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TableCellComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.column = mockColumn;
    component.value = 'Test Value';
    component.rowIndex = 0;
    component.editConfig = mockEditConfig;
    component.editable = true;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input properties', () => {
      expect(component.column).toBeDefined();
      expect(component.value).toBeDefined();
      expect(component.rowIndex).toBeDefined();
      expect(component.editable).toBe(true);
      expect(component.isEditing).toBe(false);
    });

    it('should have required output events', () => {
      expect(component.editStart).toBeDefined();
      expect(component.editEnd).toBeDefined();
      expect(component.valueChange).toBeDefined();
      expect(component.editCancel).toBeDefined();
    });

    it('should initialize editValue with current value', () => {
      component.ngOnInit();
      expect(component.editValue).toBe('Test Value');
    });
  });

  describe('Display Mode', () => {
    beforeEach(() => {
      component.isEditing = false;
      fixture.detectChanges();
    });

    it('should render cell in display mode by default', () => {
      const displayElement = fixture.debugElement.query(By.css('.tableng-cell-display'));
      expect(displayElement).toBeTruthy();
    });

    it('should show formatted value in display mode', () => {
      const displayElement = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(displayElement.nativeElement.textContent.trim()).toBe('Test Value');
    });

    it('should apply editable styling when editable is true', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cellElement.nativeElement.classList).toContain('tableng-cell-editable');
    });

    it('should not apply editable styling when editable is false', () => {
      component.editable = false;
      fixture.detectChanges();

      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cellElement.nativeElement.classList).not.toContain('tableng-cell-editable');
    });

    it('should show edit indicator when hovering over editable cell', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      const editIndicator = fixture.debugElement.query(By.css('.tableng-edit-indicator'));
      expect(editIndicator).toBeTruthy();
    });

    it('should format different data types correctly', () => {
      // Test boolean formatting
      component.column = { ...mockColumn, type: 'boolean' };
      component.value = true;
      fixture.detectChanges();

      let content = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toBe('Yes');

      // Test number formatting
      component.column = { ...mockColumn, type: 'number' };
      component.value = 1234.56;
      fixture.detectChanges();

      content = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toBe('1234.56');

      // Test date formatting
      component.column = { ...mockColumn, type: 'date' };
      component.value = new Date('2023-01-01');
      fixture.detectChanges();

      content = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toContain('2023');
    });

    it('should use custom formatter when provided', () => {
      component.column = {
        ...mockColumn,
        formatter: (value: unknown) => typeof value === 'string' ? value.toUpperCase() : String(value)
      };
      component.value = 'test value';
      fixture.detectChanges();

      const content = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toBe('TEST VALUE');
    });
  });

  describe('Edit Mode Entry', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should enter edit mode on double click', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.triggerEventHandler('dblclick', null);

      expect(component.isEditing).toBe(true);
    });

    it('should enter edit mode on Enter key press', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      cellElement.triggerEventHandler('keydown', enterEvent);

      expect(component.isEditing).toBe(true);
    });

    it('should enter edit mode on F2 key press', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      const f2Event = new KeyboardEvent('keydown', { key: 'F2' });
      
      cellElement.triggerEventHandler('keydown', f2Event);

      expect(component.isEditing).toBe(true);
    });

    it('should emit editStart event when entering edit mode', () => {
      let emittedData: unknown;
      component.editStart.subscribe((data: unknown) => emittedData = data);

      component.startEdit();

      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0,
        value: 'Test Value'
      });
    });

    it('should not enter edit mode when editable is false', () => {
      component.editable = false;
      
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.triggerEventHandler('dblclick', null);

      expect(component.isEditing).toBe(false);
    });

    it('should not enter edit mode when readonly is true', () => {
      component.editConfig = { ...mockEditConfig, readonly: true };
      
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.triggerEventHandler('dblclick', null);

      expect(component.isEditing).toBe(false);
    });

    it('should focus input element after entering edit mode', fakeAsync(() => {
      component.startEdit();
      fixture.detectChanges();
      tick();

      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(document.activeElement).toBe(inputElement.nativeElement);
    }));
  });

  describe('Edit Mode - Text Input', () => {
    beforeEach(() => {
      component.editConfig = { type: 'text' };
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render text input in edit mode', () => {
      const inputElement = fixture.debugElement.query(By.css('input[type="text"]'));
      expect(inputElement).toBeTruthy();
    });

    it('should show current value in text input', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement.nativeElement.value).toBe('Test Value');
    });

    it('should update editValue when input changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      
      inputElement.nativeElement.value = 'New Value';
      inputElement.triggerEventHandler('input', { target: { value: 'New Value' } });

      expect(component.editValue).toBe('New Value');
    });

    it('should validate required field', () => {
      component.editConfig = { type: 'text', required: true };
      component.editValue = '';
      
      const isValid = component.validateValue();
      expect(isValid).toBe(false);
      expect(component.validationError).toContain('required');
    });

    it('should validate with custom validator', () => {
      component.editConfig = {
        type: 'text',
        validator: (value: unknown) => typeof value === 'string' && value.length >= 3 ? null : 'Minimum 3 characters'
      };
      component.editValue = 'ab';
      
      const isValid = component.validateValue();
      expect(isValid).toBe(false);
      expect(component.validationError).toBe('Minimum 3 characters');
    });

    it('should show validation error styling', () => {
      component.editConfig = { type: 'text', required: true };
      component.editValue = '';
      component.validateValue();
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement.nativeElement.classList).toContain('tableng-input-error');
    });
  });

  describe('Edit Mode - Number Input', () => {
    beforeEach(() => {
      component.column = { ...mockColumn, type: 'number' };
      component.editConfig = { type: 'number' };
      component.value = 123;
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render number input in edit mode', () => {
      const inputElement = fixture.debugElement.query(By.css('input[type="number"]'));
      expect(inputElement).toBeTruthy();
    });

    it('should handle number validation', () => {
      component.editValue = 'invalid';
      
      const isValid = component.validateValue();
      expect(isValid).toBe(false);
    });

    it('should convert string to number on save', () => {
      component.editValue = '456';
      component.saveEdit();
      
      expect(component.value).toBe(456);
    });
  });

  describe('Edit Mode - Date Input', () => {
    beforeEach(() => {
      component.column = { ...mockColumn, type: 'date' };
      component.editConfig = { type: 'date' };
      component.value = new Date('2023-01-01');
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render date input in edit mode', () => {
      const inputElement = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(inputElement).toBeTruthy();
    });

    it('should format date for input value', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement.nativeElement.value).toBe('2023-01-01');
    });

    it('should handle invalid date input', () => {
      component.editValue = 'invalid-date';
      
      const isValid = component.validateValue();
      expect(isValid).toBe(false);
    });
  });

  describe('Edit Mode - Select Input', () => {
    beforeEach(() => {
      component.editConfig = {
        type: 'select',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' }
        ]
      };
      component.value = 'option1';
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render select dropdown in edit mode', () => {
      const selectElement = fixture.debugElement.query(By.css('select'));
      expect(selectElement).toBeTruthy();
    });

    it('should show all options in select dropdown', () => {
      const optionElements = fixture.debugElement.queryAll(By.css('option'));
      expect(optionElements.length).toBe(3);
      expect(optionElements[0].nativeElement.textContent.trim()).toBe('Option 1');
    });

    it('should select current value', () => {
      const selectElement = fixture.debugElement.query(By.css('select'));
      expect(selectElement.nativeElement.value).toBe('option1');
    });
  });

  describe('Edit Mode - Checkbox Input', () => {
    beforeEach(() => {
      component.column = { ...mockColumn, type: 'boolean' };
      component.editConfig = { type: 'checkbox' };
      component.value = true;
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render checkbox in edit mode', () => {
      const checkboxElement = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      expect(checkboxElement).toBeTruthy();
    });

    it('should show current boolean value', () => {
      const checkboxElement = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      expect(checkboxElement.nativeElement.checked).toBe(true);
    });

    it('should toggle value on click', () => {
      const checkboxElement = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      
      checkboxElement.triggerEventHandler('change', { target: { checked: false } });
      expect(component.editValue).toBe(false);
    });
  });

  describe('Edit Mode - Custom Input', () => {
    beforeEach(() => {
      component.editConfig = { type: 'custom' };
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render custom editor container', () => {
      const customContainer = fixture.debugElement.query(By.css('.tableng-custom-editor'));
      expect(customContainer).toBeTruthy();
    });

    it('should project custom content', () => {
      const contentElement = fixture.debugElement.query(By.css('.tableng-custom-content'));
      expect(contentElement).toBeTruthy();
    });
  });

  describe('Edit Mode - Save Operations', () => {
    beforeEach(() => {
      component.startEdit();
      fixture.detectChanges();
    });

    it('should save changes on Enter key', () => {
      component.editValue = 'New Value';
      const inputElement = fixture.debugElement.query(By.css('input'));
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      inputElement.triggerEventHandler('keydown', enterEvent);
      
      expect(component.isEditing).toBe(false);
      expect(component.value).toBe('New Value');
    });

    it('should save changes on Tab key', () => {
      component.editValue = 'New Value';
      const inputElement = fixture.debugElement.query(By.css('input'));
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      
      inputElement.triggerEventHandler('keydown', tabEvent);
      
      expect(component.isEditing).toBe(false);
      expect(component.value).toBe('New Value');
    });

    it('should save changes on blur', fakeAsync(() => {
      component.editValue = 'New Value';
      const inputElement = fixture.debugElement.query(By.css('input'));
      
      inputElement.triggerEventHandler('blur', null);
      tick(100); // Wait for the setTimeout in blur handler
      
      expect(component.isEditing).toBe(false);
      expect(component.value).toBe('New Value');
    }));

    it('should emit valueChange event on save', () => {
      let emittedData: unknown;
      component.valueChange.subscribe((data: unknown) => emittedData = data);
      
      component.editValue = 'New Value';
      component.saveEdit();
      
      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0,
        oldValue: 'Test Value',
        newValue: 'New Value'
      });
    });

    it('should emit editEnd event on save', () => {
      let emittedData: unknown;
      component.editEnd.subscribe((data: unknown) => emittedData = data);
      
      component.saveEdit();
      
      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0,
        saved: true
      });
    });

    it('should not save if validation fails', () => {
      component.editConfig = { type: 'text', required: true };
      component.editValue = '';
      
      component.saveEdit();
      
      expect(component.isEditing).toBe(true);
      expect(component.value).toBe('Test Value');
    });
  });

  describe('Edit Mode - Cancel Operations', () => {
    beforeEach(() => {
      component.startEdit();
      component.editValue = 'Modified Value';
      fixture.detectChanges();
    });

    it('should cancel changes on Escape key', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      
      inputElement.triggerEventHandler('keydown', escapeEvent);
      
      expect(component.isEditing).toBe(false);
      expect(component.value).toBe('Test Value');
    });

    it('should emit editCancel event on cancel', () => {
      let emittedData: unknown;
      component.editCancel.subscribe((data: unknown) => emittedData = data);
      
      component.cancelEdit();
      
      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0
      });
    });

    it('should emit editEnd event on cancel', () => {
      let emittedData: unknown;
      component.editEnd.subscribe((data: unknown) => emittedData = data);
      
      component.cancelEdit();
      
      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0,
        saved: false
      });
    });

    it('should reset editValue to original value on cancel', () => {
      component.cancelEdit();
      expect(component.editValue).toBe('Test Value');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes in display mode', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cellElement.nativeElement.getAttribute('role')).toBe('gridcell');
      expect(cellElement.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should have proper ARIA attributes in edit mode', () => {
      component.startEdit();
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement.nativeElement.getAttribute('aria-label')).toContain('Edit');
    });

    it('should announce validation errors to screen readers', () => {
      component.editConfig = { type: 'text', required: true };
      component.startEdit();
      component.editValue = '';
      component.validateValue();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('.tableng-validation-error'));
      expect(errorElement.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should support keyboard navigation', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.nativeElement.focus();
      
      expect(document.activeElement).toBe(cellElement.nativeElement);
    });
  });

  describe('Error Handling', () => {
    it('should handle null values gracefully', () => {
      component.value = null;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
      
      const content = fixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle undefined values gracefully', () => {
      component.value = undefined;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle missing column gracefully', () => {
      component.column = null as unknown as ColumnDefinition;
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle missing editConfig gracefully', () => {
      component.editConfig = null as unknown as CellEditConfig;
      component.startEdit();
      
      expect(component.isEditing).toBe(true);
    });

    it('should handle formatter errors gracefully', () => {
      component.column = {
        ...mockColumn,
        formatter: () => { throw new Error('Formatter error'); }
      };
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle multiple change detection cycles', () => {
      // Multiple detectChanges should not cause errors
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should cleanup component properly', () => {
      // Component should be destroyable without errors
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });
});