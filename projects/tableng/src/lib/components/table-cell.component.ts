import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';
import { ValidatorConfig } from '../interfaces/validator-config.interface';

@Component({
  selector: 'tng-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss']
})
export class TableCellComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() column!: ColumnDefinition;
  @Input() value: unknown;
  @Input() rowIndex!: number;
  @Input() editConfig: CellEditConfig | null = null;
  @Input() editable: boolean = false;
  @Input() isFirstColumn: boolean = false;
  @Input() level: number = 0;
  @Input() hasChildren: boolean = false;
  @Input() isExpanded: boolean = false;

  @Output() editStart = new EventEmitter<{
    column: string;
    rowIndex: number;
    value: unknown;
  }>();

  @Output() editEnd = new EventEmitter<{
    column: string;
    rowIndex: number;
    saved: boolean;
  }>();

  @Output() valueChange = new EventEmitter<{
    column: string;
    rowIndex: number;
    oldValue: unknown;
    newValue: unknown;
  }>();

  @Output() editCancel = new EventEmitter<{
    column: string;
    rowIndex: number;
  }>();

  @Output() toggleExpand = new EventEmitter<void>();

  @ViewChild('editInput') editInput!: ElementRef;

  isEditing: boolean = false;
  originalValue: unknown;
  cellControl!: FormControl;
  showEditIndicator: boolean = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.originalValue = this.value;
    this.setupFormControl();
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions or resources
  }

  ngAfterViewInit(): void {
    // Component is ready
  }

  // Display formatting
  getFormattedValue(): string {
    try {
      if (this.value == null) {
        return '';
      }

      // Use custom formatter if provided
      if (this.column?.formatter) {
        return this.column.formatter(this.value);
      }

      // Default formatting by type
      switch (this.column?.type) {
        case 'boolean':
          return this.value ? 'Yes' : 'No';
        case 'number':
          return typeof this.value === 'number' ? this.value.toString() : String(this.value);
        case 'date':
          if (this.value instanceof Date) {
            return this.value.toLocaleDateString();
          }
          return String(this.value);
        default:
          return String(this.value);
      }
    } catch (error) {
      return String(this.value || '');
    }
  }

  formatValue(): string {
    return this.getFormattedValue();
  }

  // Edit mode management
  startEdit(): void {
    if (!this.editable || this.editConfig?.readonly || this.editConfig?.disabled) {
      return;
    }

    this.isEditing = true;
    this.cellControl.setValue(this.value);
    this.cellControl.markAsPristine();

    this.editStart.emit({
      column: this.column.key,
      rowIndex: this.rowIndex,
      value: this.value
    });

    // Focus input after view update
    setTimeout(() => {
      if (this.editInput) {
        this.editInput.nativeElement.focus();
      }
    });
  }

  saveEdit(): void {
    if (this.cellControl.invalid) {
      return;
    }

    const oldValue = this.value;
    this.value = this.cellControl.value;
    this.isEditing = false;

    this.valueChange.emit({
      column: this.column.key,
      rowIndex: this.rowIndex,
      oldValue: oldValue,
      newValue: this.value
    });

    this.editEnd.emit({
      column: this.column.key,
      rowIndex: this.rowIndex,
      saved: true
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.cellControl.setValue(this.originalValue);

    this.editCancel.emit({
      column: this.column.key,
      rowIndex: this.rowIndex
    });

    this.editEnd.emit({
      column: this.column.key,
      rowIndex: this.rowIndex,
      saved: false
    });
  }

  // Validation
  setupFormControl(): void {
    const validators: ValidatorFn[] = [];
    if (this.editConfig?.required) {
      validators.push(Validators.required);
    }
    if (this.editConfig?.minLength) {
      validators.push(Validators.minLength(this.editConfig.minLength));
    }
    if (this.editConfig?.maxLength) {
      validators.push(Validators.maxLength(this.editConfig.maxLength));
    }
    if (this.editConfig?.pattern) {
      validators.push(Validators.pattern(this.editConfig.pattern));
    }
    if (this.editConfig?.validators) {
      this.editConfig.validators.forEach((validatorConfig: ValidatorConfig) => {
        validators.push((control: AbstractControl) => {
          return validatorConfig.validator(control.value) ? null : { [validatorConfig.type]: true };
        });
      });
    }

    this.cellControl = new FormControl(this.value, validators);
  }

  get validationError(): string | null {
    if (!this.cellControl || !this.cellControl.errors) {
      return null;
    }

    const errors = this.cellControl.errors;
    if (errors['required']) {
      return 'This field is required';
    }
    if (errors['minlength']) {
      return `Minimum length is ${this.editConfig?.minLength}`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${this.editConfig?.maxLength}`;
    }
    if (errors['pattern']) {
      return 'Invalid format';
    }
    
    // Check for custom validator errors
    if (this.editConfig?.validators) {
      for (const validator of this.editConfig.validators) {
        if (errors[validator.type]) {
          return validator.message;
        }
      }
    }
    
    return 'Invalid value';
  }

  // Value processing
  processEditValue(): unknown {
    if (this.cellControl.value == null || this.cellControl.value === '') {
      return this.cellControl.value;
    }

    switch (this.getEditType()) {
      case 'number':
        return Number(this.cellControl.value);
      case 'date':
        return new Date(String(this.cellControl.value));
      case 'checkbox':
        return Boolean(this.cellControl.value);
      default:
        return this.cellControl.value;
    }
  }

  // Edit type determination
  getEditType(): string {
    return this.editConfig?.type || this.column?.type || 'text';
  }

  // Date input helpers
  getDateInputValue(): string {
    if (!this.cellControl.value) return '';
    
    try {
      const date = this.cellControl.value instanceof Date ? this.cellControl.value : new Date(String(this.cellControl.value));
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  // Event handlers
  onDoubleClick(): void {
    this.startEdit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isEditing) {
      switch (event.key) {
        case 'Enter':
        case 'F2':
          event.preventDefault();
          this.startEdit();
          break;
      }
    }
  }

  onEditKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.saveEdit();
        break;
      case 'Escape':
        event.preventDefault();
        this.cancelEdit();
        break;
    }
  }

  onInputChange(event: Event): void {
    // Value is handled by form control
  }

  onSelectChange(event: Event): void {
    // Value is handled by form control
  }

  onCheckboxChange(event: Event): void {
    // Value is handled by form control
  }

  onBlur(): void {
    // Add a small delay to allow other interactions (like clicking cancel button)
    setTimeout(() => {
      if (this.isEditing) {
        this.saveEdit();
      }
    }, 100);
  }

  onMouseEnter(): void {
    if (this.editable && !this.isEditing && !this.editConfig?.readonly && !this.editConfig?.disabled) {
      this.showEditIndicator = true;
    }
  }

  onMouseLeave(): void {
    this.showEditIndicator = false;
  }

  onToggleExpand(event: MouseEvent): void {
    event.stopPropagation(); // Prevent row selection or other parent events
    this.toggleExpand.emit();
  }
}