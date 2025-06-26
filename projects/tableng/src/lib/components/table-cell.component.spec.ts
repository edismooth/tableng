import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableCellComponent } from './table-cell.component';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';
import { ValidatorConfig } from '../interfaces/validator-config.interface';

describe('TableCellComponent', () => {
  let component: TableCellComponent;
  let fixture: ComponentFixture<TableCellComponent>;

  const mockColumn: ColumnDefinition = {
    key: 'name',
    title: 'Name',
    type: 'text',
    width: 200,
    editable: true,
  };

  const mockEditConfig: CellEditConfig = {
    type: 'text',
    required: false,
    disabled: false,
    readonly: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableCellComponent],
      imports: [FormsModule, ReactiveFormsModule],
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

    it('should initialize cellControl with current value on init', () => {
      fixture.detectChanges(); // Trigger ngOnInit
      expect(component.cellControl.value).toBe('Test Value');
    });
  });

  describe('Display Mode', () => {
    beforeEach(() => {
      component.isEditing = false;
      fixture.detectChanges();
    });

    it('should render cell in display mode by default', () => {
      const displayElement = fixture.debugElement.query(
        By.css('.tableng-cell-display')
      );
      expect(displayElement).toBeTruthy();
    });

    it('should show formatted value in display mode', () => {
      const displayElement = fixture.debugElement.query(
        By.css('.tableng-cell-content')
      );
      expect(displayElement.nativeElement.textContent.trim()).toBe(
        'Test Value'
      );
    });

    it('should apply editable styling when editable is true', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cellElement.nativeElement.classList).toContain(
        'tableng-cell-editable'
      );
    });

    it('should not apply editable styling when editable is false', () => {
      component.editable = false;
      fixture.detectChanges();

      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      expect(cellElement.nativeElement.classList).not.toContain(
        'tableng-cell-editable'
      );
    });

    it('should show edit indicator when hovering over editable cell', () => {
      const cellElement = fixture.debugElement.query(By.css('.tableng-cell'));
      cellElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      const editIndicator = fixture.debugElement.query(
        By.css('.tableng-edit-indicator')
      );
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
        formatter: (value: unknown) =>
          typeof value === 'string' ? value.toUpperCase() : String(value),
      };
      component.value = 'test value';
      fixture.detectChanges();

      const content = fixture.debugElement.query(
        By.css('.tableng-cell-content')
      );
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
      component.editStart.subscribe((data: unknown) => (emittedData = data));

      component.startEdit();

      expect(emittedData).toEqual({
        column: mockColumn.key,
        rowIndex: 0,
        value: 'Test Value',
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
      fixture.detectChanges();
      component.editConfig = { type: 'text' };
      component.startEdit();
      fixture.detectChanges();
    });

    it('should render text input in edit mode', () => {
      const inputElement = fixture.debugElement.query(
        By.css('input[type="text"]')
      );
      expect(inputElement).toBeTruthy();
    });

    it('should show current value in text input', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement.nativeElement.value).toBe('Test Value');
    });

    it('should update cellControl when input changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));

      inputElement.nativeElement.value = 'New Value';
      inputElement.triggerEventHandler('input', {
        target: { value: 'New Value' },
      });

      expect(component.cellControl.value).toBe('New Value');
    });
  });

  describe('Inline Editing & Validation', () => {
    beforeEach(() => {
      fixture.detectChanges(); // This will trigger ngOnInit
      component.startEdit();
    });

    it('should show validation error for required field', fakeAsync(() => {
      component.editConfig = { ...mockEditConfig, required: true };
      (component as any).setupFormControl(); // Re-initialize to apply new config
      fixture.detectChanges();

      component.cellControl.setValue('');
      component.cellControl.markAsTouched();
      tick();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'This field is required'
      );
    }));

    it('should show validation error for minLength', fakeAsync(() => {
      component.editConfig = { ...mockEditConfig, minLength: 5 };
      (component as any).setupFormControl();
      fixture.detectChanges();

      component.cellControl.setValue('123');
      component.cellControl.markAsTouched();
      tick();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Minimum length is 5'
      );
    }));

    it('should show validation error for pattern', fakeAsync(() => {
      component.editConfig = { ...mockEditConfig, pattern: '^[a-zA-Z]+$' }; // Only letters
      (component as any).setupFormControl();
      fixture.detectChanges();

      component.cellControl.setValue('123');
      component.cellControl.markAsTouched();
      tick();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Invalid format'
      );
    }));

    it('should show custom validation error message', fakeAsync(() => {
      const customValidators: ValidatorConfig[] = [
        {
          type: 'custom',
          validator: (value: any) => value !== 'invalid',
          message: 'Cannot use the word "invalid"',
        },
      ];
      component.editConfig = {
        ...mockEditConfig,
        validators: customValidators,
      };
      (component as any).setupFormControl();
      fixture.detectChanges();

      component.cellControl.setValue('invalid');
      component.cellControl.markAsTouched();
      tick();
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Cannot use the word "invalid"'
      );
    }));

    it('should apply ng-invalid class to input on error', fakeAsync(() => {
      component.editConfig = { ...mockEditConfig, required: true };
      (component as any).setupFormControl();
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(
        By.css('input')
      ).nativeElement;
      component.cellControl.setValue('');
      component.cellControl.markAsTouched();
      tick();
      fixture.detectChanges();

      expect(inputElement.classList).toContain('ng-invalid');
    }));

    it('should not emit valueChange when form is invalid', fakeAsync(() => {
      jest.spyOn(component.valueChange, 'emit');
      component.editConfig = { ...mockEditConfig, required: true };
      (component as any).setupFormControl();
      fixture.detectChanges();

      component.cellControl.setValue('');
      tick();

      component.saveEdit();
      expect(component.valueChange.emit).not.toHaveBeenCalled();
    }));

    it('should emit valueChange when form becomes valid', fakeAsync(() => {
      jest.spyOn(component.valueChange, 'emit');
      component.editConfig = { ...mockEditConfig, required: true };
      (component as any).setupFormControl();
      fixture.detectChanges();

      component.cellControl.setValue('Valid Value');
      tick();

      component.saveEdit();
      expect(component.valueChange.emit).toHaveBeenCalled();
    }));
  });
});
