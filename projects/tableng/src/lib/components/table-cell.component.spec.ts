import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
      imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
      // Create fresh component instance to avoid state pollution
      const freshFixture = TestBed.createComponent(TableCellComponent);
      const freshComponent = freshFixture.componentInstance;

      freshComponent.column = mockColumn;
      freshComponent.value = 'Test Value';
      freshComponent.rowIndex = 0;
      freshComponent.editConfig = {
        ...mockEditConfig,
        readonly: false,
        disabled: false,
      };
      freshComponent.editable = false; // Set to false

      freshFixture.detectChanges();

      const cellElement = freshFixture.debugElement.query(
        By.css('.tableng-cell')
      );
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
      // Test boolean formatting - create fresh component
      const boolFixture = TestBed.createComponent(TableCellComponent);
      const boolComponent = boolFixture.componentInstance;
      boolComponent.column = { ...mockColumn, type: 'boolean' };
      boolComponent.value = true;
      boolComponent.rowIndex = 0;
      boolComponent.editable = false;
      boolFixture.detectChanges();

      let content = boolFixture.debugElement.query(
        By.css('.tableng-cell-content')
      );
      expect(content.nativeElement.textContent.trim()).toBe('Yes');

      // Test number formatting - create fresh component
      const numFixture = TestBed.createComponent(TableCellComponent);
      const numComponent = numFixture.componentInstance;
      numComponent.column = { ...mockColumn, type: 'number' };
      numComponent.value = 1234.56;
      numComponent.rowIndex = 0;
      numComponent.editable = false;
      numFixture.detectChanges();

      content = numFixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toBe('1234.56');

      // Test date formatting - create fresh component
      const dateFixture = TestBed.createComponent(TableCellComponent);
      const dateComponent = dateFixture.componentInstance;
      dateComponent.column = { ...mockColumn, type: 'date' };
      dateComponent.value = new Date('2023-01-01');
      dateComponent.rowIndex = 0;
      dateComponent.editable = false;
      dateFixture.detectChanges();

      content = dateFixture.debugElement.query(By.css('.tableng-cell-content'));
      expect(content.nativeElement.textContent.trim()).toContain('2023');
    });

    it('should use custom formatter when provided', () => {
      // Create fresh component for custom formatter test
      const customFixture = TestBed.createComponent(TableCellComponent);
      const customComponent = customFixture.componentInstance;

      customComponent.column = {
        ...mockColumn,
        formatter: (value: unknown) =>
          typeof value === 'string' ? value.toUpperCase() : String(value),
      };
      customComponent.value = 'test value';
      customComponent.rowIndex = 0;
      customComponent.editable = false;
      customFixture.detectChanges();

      const content = customFixture.debugElement.query(
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
      component.editConfig = { type: 'text' };
      component.column = { ...mockColumn, type: 'text' };
      fixture.detectChanges();

      component.startEdit();
      fixture.detectChanges();
      tick();

      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement).toBeTruthy(); // First ensure input exists
      if (inputElement) {
        expect(document.activeElement).toBe(inputElement.nativeElement);
      }
    }));
  });

  describe('Edit Mode - Text Input', () => {
    beforeEach(() => {
      component.editConfig = { type: 'text' };
      component.column = { ...mockColumn, type: 'text' }; // Ensure column type is text
      fixture.detectChanges();
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
      expect(inputElement).toBeTruthy();
      expect(inputElement.nativeElement.value).toBe('Test Value');
    });

    it('should update cellControl when input changes', () => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      expect(inputElement).toBeTruthy();

      inputElement.nativeElement.value = 'New Value';
      inputElement.triggerEventHandler('input', {
        target: { value: 'New Value' },
      });

      expect(component.cellControl.value).toBe('New Value');
    });
  });

  describe('Inline Editing & Validation', () => {
    beforeEach(() => {
      component.editConfig = { type: 'text' };
      component.column = { ...mockColumn, type: 'text' }; // Ensure column type is text
      fixture.detectChanges(); // This will trigger ngOnInit
      component.startEdit();
      fixture.detectChanges();
    });

    it('should show validation error for required field', fakeAsync(() => {
      // Create a fresh component with required validation
      const validationFixture = TestBed.createComponent(TableCellComponent);
      const validationComponent = validationFixture.componentInstance;

      validationComponent.column = { ...mockColumn, type: 'text' };
      validationComponent.value = 'Test Value';
      validationComponent.rowIndex = 0;
      validationComponent.editConfig = {
        ...mockEditConfig,
        required: true,
        type: 'text',
      };
      validationComponent.editable = true;

      validationFixture.detectChanges();
      validationComponent.startEdit();
      validationFixture.detectChanges();

      // Set invalid value and mark as touched
      validationComponent.cellControl.setValue('');
      validationComponent.cellControl.markAsTouched();
      validationComponent.cellControl.markAsDirty();
      tick();
      validationFixture.detectChanges();

      const errorElement = validationFixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'This field is required'
      );
    }));

    it('should show validation error for minLength', fakeAsync(() => {
      // Create a fresh component with minLength validation
      const minLengthFixture = TestBed.createComponent(TableCellComponent);
      const minLengthComponent = minLengthFixture.componentInstance;

      minLengthComponent.column = { ...mockColumn, type: 'text' };
      minLengthComponent.value = 'Test Value';
      minLengthComponent.rowIndex = 0;
      minLengthComponent.editConfig = {
        ...mockEditConfig,
        minLength: 5,
        type: 'text',
      };
      minLengthComponent.editable = true;

      minLengthFixture.detectChanges();
      minLengthComponent.startEdit();
      minLengthFixture.detectChanges();

      // Set short value and mark as touched
      minLengthComponent.cellControl.setValue('123');
      minLengthComponent.cellControl.markAsTouched();
      minLengthComponent.cellControl.markAsDirty();
      tick();
      minLengthFixture.detectChanges();

      const errorElement = minLengthFixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Minimum length is 5'
      );
    }));

    it('should show validation error for pattern', fakeAsync(() => {
      // Create a fresh component with pattern validation
      const patternFixture = TestBed.createComponent(TableCellComponent);
      const patternComponent = patternFixture.componentInstance;

      patternComponent.column = { ...mockColumn, type: 'text' };
      patternComponent.value = 'Test Value';
      patternComponent.rowIndex = 0;
      patternComponent.editConfig = {
        ...mockEditConfig,
        pattern: '^[a-zA-Z]+$',
        type: 'text',
      }; // Only letters
      patternComponent.editable = true;

      patternFixture.detectChanges();
      patternComponent.startEdit();
      patternFixture.detectChanges();

      // Set invalid pattern value and mark as touched
      patternComponent.cellControl.setValue('123');
      patternComponent.cellControl.markAsTouched();
      patternComponent.cellControl.markAsDirty();
      tick();
      patternFixture.detectChanges();

      const errorElement = patternFixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Invalid format'
      );
    }));

    it('should show custom validation error message', fakeAsync(() => {
      // Create a fresh component with custom validation
      const customFixture = TestBed.createComponent(TableCellComponent);
      const customComponent = customFixture.componentInstance;

      const customValidators: ValidatorConfig[] = [
        {
          type: 'custom',
          validator: (value: any) => value !== 'invalid',
          message: 'Cannot use the word "invalid"',
        },
      ];

      customComponent.column = { ...mockColumn, type: 'text' };
      customComponent.value = 'Test Value';
      customComponent.rowIndex = 0;
      customComponent.editConfig = {
        ...mockEditConfig,
        validators: customValidators,
        type: 'text',
      };
      customComponent.editable = true;

      customFixture.detectChanges();
      customComponent.startEdit();
      customFixture.detectChanges();

      // Set invalid value and mark as touched
      customComponent.cellControl.setValue('invalid');
      customComponent.cellControl.markAsTouched();
      customComponent.cellControl.markAsDirty();
      tick();
      customFixture.detectChanges();

      const errorElement = customFixture.debugElement.query(
        By.css('.tableng-validation-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent).toContain(
        'Cannot use the word "invalid"'
      );
    }));

    it('should apply ng-invalid class to input on error', fakeAsync(() => {
      // Create a fresh component for ng-invalid class test
      const invalidFixture = TestBed.createComponent(TableCellComponent);
      const invalidComponent = invalidFixture.componentInstance;

      invalidComponent.column = { ...mockColumn, type: 'text' };
      invalidComponent.value = 'Test Value';
      invalidComponent.rowIndex = 0;
      invalidComponent.editConfig = {
        ...mockEditConfig,
        required: true,
        type: 'text',
      };
      invalidComponent.editable = true;

      invalidFixture.detectChanges();
      invalidComponent.startEdit();
      invalidFixture.detectChanges();

      const inputQuery = invalidFixture.debugElement.query(By.css('input'));
      expect(inputQuery).toBeTruthy();
      const inputElement = inputQuery.nativeElement;

      invalidComponent.cellControl.setValue('');
      invalidComponent.cellControl.markAsTouched();
      invalidComponent.cellControl.markAsDirty();
      tick();
      invalidFixture.detectChanges();

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
