# Contributing to TableNG Website

Welcome to the TableNG website contribution guide! This document will help you understand how to contribute to our documentation and examples.

## 🏗️ Project Structure

```
tableng/
├── docs/                    # Documentation files
│   ├── getting-started.md   # Getting started guide
│   ├── api-reference.md     # API documentation
│   ├── theming.md          # Theming and customization
│   └── examples.md         # Usage examples
├── examples/               # Live examples and demos
│   ├── basic/             # Basic usage examples
│   ├── advanced/          # Advanced features
│   └── theming/           # Theme examples
├── projects/tableng/      # Main library source
└── demo-app.html         # Local demo application
```

## 📝 Adding Documentation

### Creating New Documentation Pages

1. **Create the file**: Add new `.md` files in the `docs/` directory
2. **Follow naming conventions**: Use kebab-case for filenames (e.g., `advanced-filtering.md`)
3. **Add to navigation**: Update the main documentation index if creating new sections

### Documentation Standards

- **Use clear headings**: Structure content with H1, H2, H3 hierarchy
- **Include code examples**: Provide working TypeScript/HTML examples
- **Add inline comments**: Explain complex code snippets
- **Cross-reference**: Link to related documentation sections

### Example Documentation Template

```markdown
# Feature Name

Brief description of the feature and its purpose.

## Basic Usage

```typescript
// Basic example with comments
import { TablengModule } from 'tableng';

@Component({
  // Component implementation
})
export class ExampleComponent {
  // Property descriptions
}
```

## Advanced Configuration

Detailed explanation of advanced options.

## See Also

- [Related Feature](./related-feature.md)
- [API Reference](./api-reference.md)
```

## 🎯 Adding Examples

### Creating New Examples

1. **Choose the right category**:
   - `examples/basic/` - Simple, introductory examples
   - `examples/advanced/` - Complex feature demonstrations
   - `examples/theming/` - Visual customization examples

2. **Create the example structure**:
   ```
   examples/feature-name/
   ├── README.md           # Example description
   ├── example.component.ts # Angular component
   ├── example.component.html # Template
   ├── example.component.scss # Styles (if needed)
   └── demo-data.ts       # Sample data
   ```

### Example Standards

- **Self-contained**: Each example should work independently
- **Documented**: Include README.md explaining the example
- **Realistic data**: Use meaningful sample data
- **Performance conscious**: Follow Angular best practices

### Example Template

```typescript
import { Component } from '@angular/core';
import { TableColumn, TableConfig } from 'tableng';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  // Clear property documentation
  tableData = [
    // Sample data that demonstrates the feature
  ];

  columns: TableColumn[] = [
    // Column definitions with explanatory comments
  ];

  config: TableConfig = {
    // Configuration options with purpose explained
  };
}
```

## 🚀 Development Workflow

### Setting Up Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/edismooth/tableng.git
   cd tableng
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run start
   ```

### Testing Your Changes

1. **View documentation**: Open `http://localhost:4200` to see documentation
2. **Test examples**: Navigate to examples section to verify functionality
3. **Check responsiveness**: Test on different screen sizes
4. **Validate links**: Ensure all internal links work correctly

### Building for Production

```bash
# Build the production version
npm run build:prod

# Test the production build
npm run start:prod
```

## 📐 Style Guidelines

### Writing Style

- **Clear and concise**: Use simple, direct language
- **Action-oriented**: Start instructions with action verbs
- **Consistent terminology**: Use the same terms throughout
- **User-focused**: Write from the user's perspective

### Code Style

- **Follow project conventions**: Match existing code formatting
- **Use meaningful names**: Clear variable and method names
- **Add comments**: Explain complex logic
- **Handle errors**: Include error handling in examples

### Markdown Formatting

- **Use consistent headers**: Follow H1 > H2 > H3 hierarchy
- **Format code blocks**: Specify language for syntax highlighting
- **Use lists effectively**: Organize information with bullets/numbers
- **Add line breaks**: Improve readability with white space

## 🔍 Review Process

### Before Submitting

1. **Test locally**: Verify examples work as expected
2. **Check spelling**: Use spell check on documentation
3. **Validate links**: Ensure all links are functional
4. **Review formatting**: Check markdown renders correctly

### Pull Request Guidelines

1. **Descriptive title**: Clearly describe the changes
2. **Detailed description**: Explain what was added/changed and why
3. **Include screenshots**: For visual changes, add before/after images
4. **Reference issues**: Link to related issues if applicable

### Review Criteria

- **Accuracy**: Technical content is correct
- **Completeness**: Examples include all necessary code
- **Clarity**: Documentation is easy to understand
- **Consistency**: Follows project conventions

## 📞 Getting Help

- **Questions**: Open a discussion on GitHub
- **Bug reports**: Use the bug report issue template
- **Feature requests**: Use the feature request template
- **General help**: Check existing documentation first

## 🎉 Recognition

Contributors to documentation and examples are recognized in:
- Project README contributors section
- Release notes for significant contributions
- Special thanks in documentation pages

Thank you for helping improve TableNG documentation and examples!
