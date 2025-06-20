import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

@Component({
  selector: 'tng-table-cell',
  template: `
    <div class="tableng-cell"
         [class.tableng-cell-editable]="editable && !editConfig?.readonly && !editConfig?.disabled"
         [class.tableng-cell-editing]="isEditing"
         [class.tableng-cell-error]="validationError"
         role="gridcell"
         tabindex="0"
         (dblclick)="onDoubleClick()"
         (keydown)="onKeyDown($event)"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseLeave()">
      
      <!-- Display Mode -->
      <div *ngIf="!isEditing" class="tableng-cell-display">
        <div class="tableng-cell-content"
             [class.tableng-cell-text]="column?.type === 'text'"
             [class.tableng-cell-number]="column?.type === 'number'"
             [class.tableng-cell-date]="column?.type === 'date'"
             [class.tableng-cell-boolean]="column?.type === 'boolean'">
          {{ getFormattedValue() }}
        </div>
        
        <!-- Edit Indicator -->
        <div *ngIf="showEditIndicator" class="tableng-edit-indicator" aria-hidden="true">
          ✏️
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div *ngIf="isEditing" class="tableng-cell-edit">
        
        <!-- Text Input -->
        <input *ngIf="getEditType() === 'text'"
               #editInput
               type="text"
               class="tableng-input"
               [class.tableng-input-error]="validationError"
               [value]="editValue"
               [disabled]="editConfig?.disabled"
               [readonly]="editConfig?.readonly"
               [required]="editConfig?.required"
               [attr.aria-label]="'Edit ' + column?.title"
               (input)="onInputChange($event)"
               (keydown)="onEditKeyDown($event)"
               (blur)="onBlur()" />
        
        <!-- Number Input -->
        <input *ngIf="getEditType() === 'number'"
               #editInput
               type="number"
               class="tableng-input"
               [class.tableng-input-error]="validationError"
               [value]="editValue"
               [disabled]="editConfig?.disabled"
               [readonly]="editConfig?.readonly"
               [required]="editConfig?.required"
               [attr.aria-label]="'Edit ' + column?.title"
               (input)="onInputChange($event)"
               (keydown)="onEditKeyDown($event)"
               (blur)="onBlur()" />
        
        <!-- Date Input -->
        <input *ngIf="getEditType() === 'date'"
               #editInput
               type="date"
               class="tableng-input"
               [class.tableng-input-error]="validationError"
               [value]="getDateInputValue()"
               [disabled]="editConfig?.disabled"
               [readonly]="editConfig?.readonly"
               [required]="editConfig?.required"
               [attr.aria-label]="'Edit ' + column?.title"
               (input)="onInputChange($event)"
               (keydown)="onEditKeyDown($event)"
               (blur)="onBlur()" />
        
        <!-- Select Dropdown -->
        <select *ngIf="getEditType() === 'select'"
                #editInput
                class="tableng-select"
                [class.tableng-input-error]="validationError"
                [value]="editValue"
                [disabled]="editConfig?.disabled"
                [required]="editConfig?.required"
                [attr.aria-label]="'Edit ' + column?.title"
                (change)="onSelectChange($event)"
                (keydown)="onEditKeyDown($event)"
                (blur)="onBlur()">
          <option *ngFor="let option of editConfig?.options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
        
        <!-- Checkbox -->
        <input *ngIf="getEditType() === 'checkbox'"
               #editInput
               type="checkbox"
               class="tableng-checkbox"
               [checked]="editValue"
               [disabled]="editConfig?.disabled"
               [attr.aria-label]="'Edit ' + column?.title"
               (change)="onCheckboxChange($event)"
               (keydown)="onEditKeyDown($event)"
               (blur)="onBlur()" />
        
        <!-- Custom Editor -->
        <div *ngIf="getEditType() === 'custom'" class="tableng-custom-editor">
          <div class="tableng-custom-content">
            <ng-content></ng-content>
          </div>
        </div>
        
        <!-- Validation Error -->
        <div *ngIf="validationError" 
             class="tableng-validation-error"
             role="alert"
             aria-live="polite">
          {{ validationError }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tableng-cell {
      position: relative;
      padding: 8px 12px;
      border-bottom: 1px solid #e0e0e0;
      min-height: 40px;
      display: flex;
      align-items: center;
      background-color: white;
      transition: background-color 0.2s ease;
    }

    .tableng-cell:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .tableng-cell-editable {
      cursor: pointer;
    }

    .tableng-cell-editable:hover {
      background-color: #f8f9fa;
    }

    .tableng-cell-editing {
      background-color: #e7f3ff;
      border: 2px solid #007bff;
      padding: 6px 10px;
    }

    .tableng-cell-error {
      border-color: #dc3545;
      background-color: #fff5f5;
    }

    .tableng-cell-display {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tableng-cell-content {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tableng-cell-number {
      text-align: right;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    }

    .tableng-cell-date {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    }

    .tableng-cell-boolean {
      text-align: center;
      font-weight: 500;
    }

    .tableng-edit-indicator {
      opacity: 0;
      transition: opacity 0.2s ease;
      margin-left: 8px;
      font-size: 12px;
    }

    .tableng-cell-editable:hover .tableng-edit-indicator {
      opacity: 1;
    }

    .tableng-cell-edit {
      width: 100%;
    }

    .tableng-input,
    .tableng-select {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.5;
      background-color: white;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .tableng-input:focus,
    .tableng-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .tableng-input-error {
      border-color: #dc3545;
    }

    .tableng-input-error:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
    }

    .tableng-checkbox {
      width: auto;
      margin: 0;
      transform: scale(1.2);
    }

    .tableng-custom-editor {
      width: 100%;
    }

    .tableng-custom-content {
      min-height: 32px;
      display: flex;
      align-items: center;
    }

    .tableng-validation-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.3;
    }
  `]
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