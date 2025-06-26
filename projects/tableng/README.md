# TableNG

[![npm version](https://badge.fury.io/js/tableng.svg)](https://badge.fury.io/js/tableng)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-%5E16.2.0-red)](https://angular.io/)

A modern, feature-rich Angular table library designed for performance and developer experience.

## Features

✨ **Modern Design** - Clean, responsive table components
🚀 **Performance** - Optimized for large datasets with virtual scrolling
🔧 **Customizable** - Flexible theming and configuration options
📱 **Responsive** - Mobile-friendly design
🎯 **Type Safe** - Full TypeScript support
📊 **Rich Features** - Sorting, filtering, pagination, inline editing
🌳 **Tree View** - Hierarchical data display
♿ **Accessible** - WCAG compliant

## Installation

```bash
npm install tableng
```

## Quick Start

1. Import the TableNG module in your Angular module:

```typescript
import { TablengModule } from 'tableng';

@NgModule({
  imports: [
    TablengModule
  ],
  // ...
})
export class AppModule { }
```

2. Use the table component in your template:

```html
<tng-table 
  [data]="tableData" 
  [columns]="columns"
  [config]="tableConfig">
</tng-table>
```

3. Configure your component:

```typescript
import { Component } from '@angular/core';
import { ColumnDefinition, TableConfig } from 'tableng';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    // ... more data
  ];

  columns: ColumnDefinition[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'age', header: 'Age', sortable: true, type: 'number' }
  ];

  tableConfig: TableConfig = {
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    pageSize: 10
  };
}
```

## API Reference

### Components

#### TableComponent

The main table component with comprehensive data display capabilities.

**Inputs:**
- `data: any[]` - Array of data objects to display
- `columns: ColumnDefinition[]` - Column configuration
- `config?: TableConfig` - Table configuration options
- `theme?: TableTheme` - Theme customization

**Outputs:**
- `rowClick: EventEmitter<any>` - Emitted when a row is clicked
- `cellEdit: EventEmitter<any>` - Emitted when a cell is edited
- `sortChange: EventEmitter<any>` - Emitted when sorting changes
- `filterChange: EventEmitter<any>` - Emitted when filters change

### Interfaces

#### ColumnDefinition

```typescript
interface ColumnDefinition {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  customTemplate?: TemplateRef<any>;
}
```

#### TableConfig

```typescript
interface TableConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableInlineEditing?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  multiSelect?: boolean;
  virtualScrolling?: boolean;
  stickyHeader?: boolean;
  responsive?: boolean;
}
```

## Advanced Usage

### Custom Cell Templates

```html
<tng-table [data]="data" [columns]="columns">
  <ng-template #customCell let-value="value" let-row="row">
    <button class="btn btn-primary" (click)="editRow(row)">
      {{ value }}
    </button>
  </ng-template>
</tng-table>
```

### Theming

```typescript
const customTheme: TableTheme = {
  primaryColor: '#007bff',
  backgroundColor: '#ffffff',
  headerBackgroundColor: '#f8f9fa',
  borderColor: '#dee2e6',
  hoverColor: '#f5f5f5'
};
```

### Tree View

```typescript
const treeConfig: TableConfig = {
  enableTreeView: true,
  treeChildrenKey: 'children',
  treeExpandedKey: 'expanded'
};
```

## Browser Support

- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest 2 versions

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/oskargembalski/tableng/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Oskar Gembalski](https://github.com/oskargembalski)

## Support

- 📖 [Documentation](https://tableng-docs.example.com)
- 🐛 [Issue Tracker](https://github.com/oskargembalski/tableng/issues)
- 💬 [Discussions](https://github.com/oskargembalski/tableng/discussions)
