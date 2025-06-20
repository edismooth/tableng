import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

@Component({
  selector: 'tng-table-row',
  template: `
    <tr class="tableng-row"
        [class.tableng-row-selectable]="selectable"
        [class.tableng-row-selected]="selected"
        [class.tableng-row-hover]="hovering"
        [class.tableng-row-editing]="hasEditingCell"
        [class.tableng-row-even]="rowIndex % 2 === 0"
        [class.tableng-row-odd]="rowIndex % 2 === 1"
        role="row"
        tabindex="0"
        [attr.aria-selected]="selected"
        [attr.aria-describedby]="'row-' + rowIndex + '-description'"
        (click)="onRowClick($event)"
        (keydown)="onKeyDown($event)"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()">
      
      <!-- Selection Column -->
      <td *ngIf="selectable" class="tableng-row-selector" role="gridcell">
        <input type="checkbox"
               class="tableng-row-checkbox"
               [checked]="selected"
               [attr.aria-label]="'Select row ' + (rowIndex + 1)"
               (change)="onSelectionChange($event)"
               (click)="$event.stopPropagation()" />
      </td>
      
      <!-- Data Cells -->
      <td *ngFor="let column of columns; trackBy: trackColumn"
          class="tableng-cell-wrapper"
          role="gridcell">
        <tng-table-cell
          [column]="column"
          [value]="getCellValue(column)"
          [rowIndex]="rowIndex"
          [editConfig]="getEditConfig(column)"
          [editable]="editable && column.editable"
          (editStart)="onCellEditStart($event)"
          (editEnd)="onCellEditEnd($event)"
          (valueChange)="onCellValueChange($event)"
          (editCancel)="onCellEditCancel($event)">
        </tng-table-cell>
      </td>
      
      <!-- Hidden screen reader description -->
      <span [id]="'row-' + rowIndex + '-description'" class="tableng-sr-only">
        Row {{ rowIndex + 1 }}{{ selected ? ', selected' : '' }}{{ hasEditingCell ? ', editing' : '' }}
      </span>
    </tr>
  `,
  styles: [`
    .tableng-row {
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .tableng-row:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .tableng-row-selectable:hover,
    .tableng-row-hover {
      background-color: #f8f9fa;
    }

    .tableng-row-selected {
      background-color: #e7f3ff;
      border-color: #007bff;
    }

    .tableng-row-editing {
      background-color: #fff8e1;
      box-shadow: inset 0 0 0 2px #ffc107;
    }

    .tableng-row-even {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .tableng-row-odd {
      background-color: white;
    }

    .tableng-row-selected.tableng-row-even,
    .tableng-row-selected.tableng-row-odd {
      background-color: #e7f3ff;
    }

    .tableng-row-selector {
      width: 40px;
      padding: 8px;
      text-align: center;
      border-right: 1px solid #e0e0e0;
    }

    .tableng-row-checkbox {
      width: 16px;
      height: 16px;
      margin: 0;
      cursor: pointer;
    }

    .tableng-row-checkbox:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    .tableng-cell-wrapper {
      padding: 0;
      vertical-align: top;
    }

    .tableng-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class TableRowComponent implements OnInit, OnDestroy {
  @Input() columns: ColumnDefinition[] = [];
  @Input() rowData: any = {};
  @Input() rowIndex!: number;
  @Input() editConfigs: Record<string, CellEditConfig> | null = null;
  @Input() selectable: boolean = false;
  @Input() editable: boolean = false;
  @Input() selected: boolean = false;

  @Output() rowClick = new EventEmitter<{
    rowIndex: number;
    rowData: any;
    event: MouseEvent | KeyboardEvent;
  }>();

  @Output() rowSelect = new EventEmitter<{
    rowIndex: number;
    rowData: any;
    selected: boolean;
  }>();

  @Output() cellValueChange = new EventEmitter<{
    rowIndex: number;
    rowData: any;
    column: string;
    oldValue: any;
    newValue: any;
  }>();

  @Output() rowHover = new EventEmitter<{
    rowIndex: number;
    rowData: any;
    hovering: boolean;
  }>();

  hovering: boolean = false;
  hasEditingCell: boolean = false;

  ngOnInit(): void {
    // Initialize component state
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  // Event Handlers
  onRowClick(event: MouseEvent): void {
    this.rowClick.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      event: event
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.rowClick.emit({
          rowIndex: this.rowIndex,
          rowData: this.rowData,
          event: event
        });
        break;
      case ' ':
        if (this.selectable) {
          event.preventDefault();
          this.toggleSelection();
        }
        break;
    }
  }

  onMouseEnter(): void {
    this.hovering = true;
    this.rowHover.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      hovering: true
    });
  }

  onMouseLeave(): void {
    this.hovering = false;
    this.rowHover.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      hovering: false
    });
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selected = target.checked;
    
    this.rowSelect.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      selected: this.selected
    });
  }

  // Cell Event Handlers
  onCellEditStart(event: any): void {
    this.hasEditingCell = true;
  }

  onCellEditEnd(event: any): void {
    this.hasEditingCell = false;
  }

  onCellEditCancel(event: any): void {
    this.hasEditingCell = false;
  }

  onCellValueChange(event: any): void {
    // Update local row data
    if (this.rowData && event.column) {
      this.rowData[event.column] = event.newValue;
    }

    // Emit row-level value change event
    this.cellValueChange.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      column: event.column,
      oldValue: event.oldValue,
      newValue: event.newValue
    });
  }

  // Helper Methods
  getCellValue(column: ColumnDefinition): any {
    if (!this.rowData || !column.key) {
      return undefined;
    }
    return this.rowData[column.key];
  }

  getEditConfig(column: ColumnDefinition): CellEditConfig | null {
    if (!this.editConfigs || !column.key) {
      return null;
    }
    return this.editConfigs[column.key] || null;
  }

  toggleSelection(): void {
    this.selected = !this.selected;
    this.rowSelect.emit({
      rowIndex: this.rowIndex,
      rowData: this.rowData,
      selected: this.selected
    });
  }

  trackColumn(index: number, column: ColumnDefinition): string {
    return column.key;
  }
}