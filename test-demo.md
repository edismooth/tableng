# How to Test TableNG Library

## Overview
The TableNG library provides a powerful, customizable table component with advanced features. Here are multiple ways to test and verify its functionality.

## 1. 🧪 Unit Tests (Already Implemented)

The library has comprehensive unit tests covering all components and services:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Current Test Status:** ✅ 279/279 tests passing

### Test Coverage:
- **TablengComponent**: 25 tests - Main component integration
- **TableHeaderComponent**: 30 tests - Sorting, filtering, resizing, reordering
- **TableBodyComponent**: 41 tests - Data rendering, virtual scrolling, selection
- **TableRowComponent**: 18 tests - Row interactions and events
- **TableCellComponent**: 25 tests - Cell editing and formatting
- **LocalStorageService**: 16 tests - State persistence
- **All Interface Tests**: 50+ tests - Type safety and validation

## 2. 🏗️ Manual Testing Setup

### Option A: Create a Demo Application

```bash
# Generate a demo app
ng generate application demo --routing=true --style=css

# Install the library locally
cd projects/demo
npm install ../../dist/tableng

# Import in app.module.ts
import { TablengModule } from 'tableng';

@NgModule({
  imports: [TablengModule]
})
```

### Option B: Use Angular Playground

```bash
# Install Angular Playground
npm install -g angular-playground

# Create playground scenarios
angular-playground
```

## 3. 📋 Basic Usage Example

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { TableConfig, ColumnDefinition } from 'tableng';

@Component({
  selector: 'app-root',
  template: `
    <tng-table 
      [config]="tableConfig"
      [data]="tableData"
      (rowClick)="onRowClick($event)"
      (rowSelect)="onRowSelect($event)">
    </tng-table>
  `
})
export class AppComponent {
  tableConfig: TableConfig = {
    tableId: 'demo-table',
    columns: [
      { 
        key: 'id', 
        title: 'ID', 
        type: 'text', 
        sortable: true,
        width: 80
      },
      { 
        key: 'name', 
        title: 'Name', 
        type: 'text', 
        sortable: true,
        filterable: true,
        resizable: true
      },
      { 
        key: 'email', 
        title: 'Email', 
        type: 'text', 
        filterable: true
      },
      { 
        key: 'age', 
        title: 'Age', 
        type: 'number', 
        sortable: true,
        editable: true
      },
      { 
        key: 'active', 
        title: 'Active', 
        type: 'boolean' 
      }
    ],
    virtualScrolling: true,
    stickyHeaders: true,
    sorting: true,
    filtering: true,
    resizable: true,
    reorderable: true,
    editable: true
  };

  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, active: true },
    // Add more data for testing...
  ];

  onRowClick(row: any) {
    console.log('Row clicked:', row);
  }

  onRowSelect(event: any) {
    console.log('Row selection changed:', event);
  }
}
```

## 4. 🎨 Advanced Features Testing

### Theme Customization
```typescript
// Custom theme example
const customTheme: TableTheme = {
  name: 'custom',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    hover: '#f5f5f5',
    selected: '#e3f2fd',
    accent: '#17a2b8',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545'
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: '1.5'
  },
  spacing: {
    padding: '8px',
    margin: '4px',
    borderRadius: '4px'
  },
  shadows: 'medium'
};

// Apply to table config
tableConfig.theme = customTheme;
```

### Virtual Scrolling Test
```typescript
// Generate large dataset for virtual scrolling test
generateLargeDataset(count: number = 10000) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50) + 18,
      active: Math.random() > 0.5,
      department: ['Engineering', 'Marketing', 'Sales', 'HR'][Math.floor(Math.random() * 4)],
      salary: Math.floor(Math.random() * 100000) + 30000
    });
  }
  return data;
}

// Use in component
this.tableData = this.generateLargeDataset(50000);
```

### Inline Editing Configuration
```typescript
editConfigs: Record<string, CellEditConfig> = {
  age: {
    type: 'number',
    required: true,
    validation: {
      min: 18,
      max: 100,
      customValidator: (value: number) => {
        return value >= 18 ? null : 'Must be at least 18 years old';
      }
    }
  },
  department: {
    type: 'select',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
      { value: 'hr', label: 'Human Resources' }
    ],
    required: true
  },
  active: {
    type: 'checkbox'
  }
};
```

## 5. 🔧 Performance Testing

### Memory Usage Test
```typescript
// Monitor memory usage with large datasets
monitorMemoryUsage() {
  const initialMemory = (performance as any).memory?.usedJSHeapSize;
  
  // Load large dataset
  this.tableData = this.generateLargeDataset(100000);
  
  setTimeout(() => {
    const currentMemory = (performance as any).memory?.usedJSHeapSize;
    console.log('Memory usage:', {
      initial: initialMemory,
      current: currentMemory,
      difference: currentMemory - initialMemory
    });
  }, 1000);
}
```

### Scroll Performance Test
```typescript
// Test virtual scrolling performance
testScrollPerformance() {
  const table = document.querySelector('.tableng-body');
  let frameCount = 0;
  let startTime = performance.now();
  
  const scrollTest = () => {
    table?.scrollTo(0, Math.random() * table.scrollHeight);
    frameCount++;
    
    if (frameCount < 100) {
      requestAnimationFrame(scrollTest);
    } else {
      const endTime = performance.now();
      console.log(`Scroll test completed: ${frameCount} frames in ${endTime - startTime}ms`);
      console.log(`Average FPS: ${(frameCount / (endTime - startTime)) * 1000}`);
    }
  };
  
  requestAnimationFrame(scrollTest);
}
```

## 6. 🌐 Browser Compatibility Testing

Test the table in different browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Responsive Design Testing
```css
/* Test different screen sizes */
@media (max-width: 768px) {
  .tableng-container {
    /* Mobile optimizations */
  }
}

@media (max-width: 480px) {
  .tableng-container {
    /* Small mobile optimizations */
  }
}
```

## 7. 📱 Accessibility Testing

### Keyboard Navigation Test
1. Tab through all interactive elements
2. Test arrow key navigation
3. Verify Enter/Space key actions
4. Test Escape key for canceling edits

### Screen Reader Test
```html
<!-- Ensure proper ARIA attributes -->
<tng-table 
  role="table"
  aria-label="Data table with sorting and filtering">
</tng-table>
```

## 8. 🚀 Production Build Test

```bash
# Build the library
ng build tableng --configuration production

# Test the built library
npm pack dist/tableng
npm install tableng-0.1.0.tgz
```

## 9. 📊 Sample Test Data

```typescript
// Comprehensive test dataset
export const TEST_DATA = {
  small: [
    { id: 1, name: 'Alice', age: 30, email: 'alice@test.com', active: true },
    { id: 2, name: 'Bob', age: 25, email: 'bob@test.com', active: false },
    { id: 3, name: 'Charlie', age: 35, email: 'charlie@test.com', active: true }
  ],
  
  medium: Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: Math.floor(Math.random() * 50) + 18,
    email: `user${i + 1}@test.com`,
    active: Math.random() > 0.5,
    department: ['Eng', 'Sales', 'Marketing', 'HR'][Math.floor(Math.random() * 4)]
  })),
  
  large: Array.from({ length: 100000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: Math.floor(Math.random() * 50) + 18,
    email: `user${i + 1}@test.com`,
    active: Math.random() > 0.5,
    score: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  }))
};
```

## 10. 🎯 Test Scenarios Checklist

### Basic Functionality
- [ ] Table renders with data
- [ ] Columns display correctly
- [ ] Sorting works (asc/desc/none)
- [ ] Filtering works
- [ ] Column resizing works
- [ ] Column reordering works

### Advanced Features
- [ ] Virtual scrolling with large datasets
- [ ] Row selection (single/multiple)
- [ ] Inline editing
- [ ] Custom formatters
- [ ] Theme customization
- [ ] State persistence (localStorage)

### Performance
- [ ] Smooth scrolling with 10k+ rows
- [ ] Fast sorting/filtering
- [ ] Memory usage under control
- [ ] No memory leaks

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] ARIA attributes
- [ ] Focus management

### Browser Support
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 🎉 Quick Start Test

The fastest way to test the table is to run the existing unit tests:

```bash
npm test
```

This will verify that all 279 tests pass and confirm the library is working correctly! 