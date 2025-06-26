# Getting Started with TableNG

Welcome to TableNG! This guide will help you get up and running with the TableNG library in your Angular application.

## Installation

```bash
npm install tableng
```

## Basic Setup

### 1. Import the Module

```typescript
import { NgModule } from '@angular/core';
import { TablengModule } from 'tableng';

@NgModule({
  imports: [
    TablengModule
  ],
  // ...
})
export class AppModule { }
```

### 2. Prepare Your Data

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const SAMPLE_DATA: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  // ... more data
];
```

### 3. Define Columns

```typescript
import { TableColumn } from 'tableng';

export const USER_COLUMNS: TableColumn[] = [
  { key: 'id', title: 'ID', sortable: true },
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'role', title: 'Role', filterable: true }
];
```

### 4. Use in Component

```typescript
import { Component } from '@angular/core';
import { SAMPLE_DATA, USER_COLUMNS } from './data';

@Component({
  selector: 'app-user-table',
  template: `
    <tableng
      [data]="users"
      [columns]="columns"
      tableId="user-table">
    </tableng>
  `
})
export class UserTableComponent {
  users = SAMPLE_DATA;
  columns = USER_COLUMNS;
}
```

## Next Steps

- [API Reference](./api-reference.md) - Complete feature documentation
- [Theming Guide](./theming.md) - Customize the appearance
- [Examples](./examples.md) - See more complex use cases

---

*This documentation is being actively developed. For the latest updates, check the repository.*
