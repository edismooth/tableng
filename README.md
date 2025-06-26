# TableNG

A powerful, customizable Angular table library with advanced features for modern web applications.

## 🚀 Features

### Core Functionality
- **Grid-based Layout**: CSS Grid foundation for optimal performance
- **Flat & Tree Tables**: Support for both simple tables and hierarchical data
- **Virtual Scrolling**: Handle large datasets efficiently
- **Horizontal/Vertical Scrolling**: With sticky headers and columns

### Data Management
- **Inline Editing**: Multiple editor types with validation
- **Filtering & Sorting**: Advanced data manipulation
- **LocalStorage Persistence**: Save table state by table ID
- **CRUD Operations**: Full data management capabilities

### User Experience
- **Drag & Drop**: Column reordering and future row reordering
- **Column Resizing**: Dynamic width adjustment
- **Visual Customization**: Extensive theming and styling options
- **Keyboard Navigation**: Full accessibility support

## 🎨 Visual Customization

TableNG provides extensive customization options:

- **Runtime Theme Switching**: Change themes on the fly
- **CSS Custom Properties**: Easy styling with CSS variables
- **Pre-built Themes**: Material Design, Bootstrap, Dark mode
- **Component-level Styling**: Granular control over appearance
- **Conditional Styling**: Style based on data values

## 🌐 Website Development

This project includes a frontend for documentation and examples. Here's how to get started with development:

### Development Commands

- **Serve Locally**: `npm run start` to serve the website locally.
- **Build**: `npm run build:prod` to build the production version.
- **Watch**: `npm run build:watch` for continuous build during development.

### Folder Structure

The project is organized as follows:

- `projects/tableng` - Angular components and logic.
- `docs/` - Markdown files for documentation.
- `examples/` - Example implementations and usage.

## 📦 Installation

```bash
npm install tableng
```

## 🏁 Quick Start

```typescript
import { TablengModule } from 'tableng';

@NgModule({
  imports: [TablengModule],
  // ...
})
export class AppModule { }
```

```html
<tableng 
  [data]="tableData" 
  [columns]="columnDefinitions"
  [config]="tableConfig"
  tableId="my-table">
</tableng>
```

## 📚 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Theming Guide](docs/theming.md)
- [Examples](docs/examples.md)

## 🛣️ Roadmap

See our [development roadmap](roadmap.md) for planned features and current progress.

## 🤝 Contributing

We welcome contributions! Please see our contribution guides:

- [General Contributing Guide](CONTRIBUTING.md) - For code contributions
- [Website Contributing Guide](CONTRIBUTING_WEBSITE.md) - For documentation and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- [Bug Reports](https://github.com/edismooth/tableng/issues/new?template=bug_report.md)
- [Feature Requests](https://github.com/edismooth/tableng/issues/new?template=feature_request.md)
- [Documentation Issues](https://github.com/edismooth/tableng/issues/new?template=documentation_bug.md)
- [Website Issues](https://github.com/edismooth/tableng/issues/new?template=website_bug.md)
- [Discussions](https://github.com/edismooth/tableng/discussions)

## 🚧 Development Status

TableNG is currently in development. See our roadmap for current progress and upcoming features.

---

**Built with ❤️ for the Angular community** 