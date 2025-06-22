import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { CellEditConfig } from '../interfaces/cell-edit-config.interface';

@Component({
  selector: 'tng-table-row',
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.scss']
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