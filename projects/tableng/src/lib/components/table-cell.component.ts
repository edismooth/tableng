import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

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

  @ViewChild('editInput') editInput!: ElementRef;

  isEditing: boolean = false;
  editValue: unknown;
  originalValue: unknown;
  validationError: string | null = null;
  showEditIndicator: boolean = false;

  ngOnInit(): void {
    this.originalValue = this.value;
    this.editValue = this.value;
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
    this.editValue = this.value;
    this.validationError = null;

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
    if (!this.validateValue()) {
      return;
    }

    const oldValue = this.value;
    this.value = this.processEditValue();
    this.isEditing = false;
    this.validationError = null;

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
    this.editValue = this.originalValue;
    this.validationError = null;

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
  validateValue(): boolean {
    this.validationError = null;

    // Required validation
    if (this.editConfig?.required && (this.editValue == null || this.editValue === '')) {
      this.validationError = 'This field is required';
      return false;
    }

    // Type-specific validation
    if (this.editValue != null && this.editValue !== '') {
      switch (this.getEditType()) {
        case 'number':
          if (isNaN(Number(this.editValue))) {
            this.validationError = 'Please enter a valid number';
            return false;
          }
          break;
        case 'date':
          if (this.editValue && isNaN(Date.parse(String(this.editValue)))) {
            this.validationError = 'Please enter a valid date';
            return false;
          }
          break;
      }
    }

    // Custom validation
    if (this.editConfig?.validator) {
      const customError = this.editConfig.validator(this.editValue);
      if (customError) {
        this.validationError = customError;
        return false;
      }
    }

    return true;
  }

  // Value processing
  processEditValue(): unknown {
    if (this.editValue == null || this.editValue === '') {
      return this.editValue;
    }

    switch (this.getEditType()) {
      case 'number':
        return Number(this.editValue);
      case 'date':
        return new Date(String(this.editValue));
      case 'checkbox':
        return Boolean(this.editValue);
      default:
        return this.editValue;
    }
  }

  // Edit type determination
  getEditType(): string {
    return this.editConfig?.type || this.column?.type || 'text';
  }

  // Date input helpers
  getDateInputValue(): string {
    if (!this.editValue) return '';
    
    try {
      const date = this.editValue instanceof Date ? this.editValue : new Date(String(this.editValue));
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
    const target = event.target as HTMLInputElement;
    this.editValue = target.value;
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.editValue = target.value;
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editValue = target.checked;
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
}