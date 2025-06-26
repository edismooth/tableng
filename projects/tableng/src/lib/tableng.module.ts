import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TablengComponent } from './tableng.component';
import { TableHeaderComponent } from './components/table-header.component';
import { TableBodyComponent } from './components/table-body.component';
import { TableRowComponent } from './components/table-row.component';
import { TableCellComponent } from './components/table-cell.component';

@NgModule({
  declarations: [
    TablengComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableCellComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    TablengComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableCellComponent,
  ],
})
export class TablengModule {}
