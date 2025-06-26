# Quality Assurance Guide

This document outlines the quality assurance setup for the TableNG library, including linting, testing, and continuous integration.

## Overview

The TableNG project uses a comprehensive QA setup that includes:

- ✅ **ESLint** with Angular preset and Tailwind class ordering
- ✅ **Prettier** with Tailwind plugin for code formatting
- ✅ **Jest** for unit testing with high coverage requirements
- ✅ **Cypress** for end-to-end testing (in website project)
- ✅ **GitHub Actions** for CI/CD with multiple quality gates
- ✅ **Branch protection** rules to enforce quality checks

## Quick Start

### Running Quality Checks Locally

```bash
# Run all quality checks (lint + format + test)
npm run quality:check

# Fix linting and formatting issues
npm run quality:fix

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build:prod

# Dry run publish
npm run publish:dry-run
```

### Pre-commit Setup

Quality checks are automatically run before commits:

```bash
# This runs automatically on git commit
npm run pre-commit

# This runs automatically on git push
npm run pre-push
```

## ESLint Configuration

### Angular + Tailwind Setup

The project uses ESLint with:
- Angular recommended rules
- TypeScript recommended rules
- Tailwind CSS class ordering plugin
- Custom component/directive prefixes (`tng`)

#### Configuration Files
- `eslint.config.js` - Main ESLint configuration
- `projects/tableng/eslint.config.js` - Library-specific rules

#### Key Rules
- `tailwindcss/classnames-order`: Enforces consistent Tailwind class ordering
- `tailwindcss/no-custom-classname`: Warns about non-Tailwind classes
- `tailwindcss/no-contradicting-classname`: Prevents conflicting classes
- `@angular-eslint/component-selector`: Enforces `tng` prefix
- `@angular-eslint/directive-selector`: Enforces `tng` prefix

#### Running ESLint

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## Prettier Configuration

### Tailwind Integration

Prettier is configured with:
- Tailwind class sorting plugin
- Angular template parser
- Consistent formatting rules

#### Configuration
- `.prettierrc.json` - Prettier settings
- Includes `prettier-plugin-tailwindcss` for class ordering

#### Usage

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

## Unit Testing

### Jest Setup

The project uses Jest with:
- Angular preset for TypeScript compilation
- Coverage thresholds (80% branches, 90% statements)
- Custom matchers for Angular testing

#### Test Structure
```
projects/tableng/src/lib/
├── components/
│   ├── *.component.spec.ts
├── services/
│   ├── *.service.spec.ts
├── interfaces/
│   ├── *.interface.spec.ts
└── components/
    └── navigation.spec.ts (enhanced navigation tests)
```

#### Coverage Requirements
- **Statements**: 90%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 90%

#### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch, coverage)
npm run test:ci
```

### Enhanced Unit Tests

The project includes comprehensive tests for:
- **Navigation**: Table pagination, sorting, filtering
- **State Management**: Column reordering, resizing, persistence
- **Data Operations**: CRUD operations, validation
- **Component Interactions**: Event handling, lifecycle hooks

Example test categories:
```typescript
describe('Table Navigation and State Management', () => {
  // Navigation tests
  describe('Table Navigation', () => { ... });
  
  // Column operations
  describe('Column Navigation and Reordering', () => { ... });
  
  // Data filtering
  describe('Data Navigation and Filtering', () => { ... });
  
  // Sorting functionality
  describe('Sorting Navigation', () => { ... });
  
  // Row selection
  describe('Selection Navigation', () => { ... });
  
  // State persistence
  describe('State Persistence Navigation', () => { ... });
});
```

## End-to-End Testing

### Cypress Setup (Website Project)

E2E tests are located in the `tableng-website` project:

```
cypress/
├── e2e/
│   ├── homepage.cy.ts
│   ├── docs-navigation.cy.ts
│   └── example-table.cy.ts
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── fixtures/
```

#### Test Categories

1. **Homepage Loading** (`homepage.cy.ts`)
   - Page loads successfully
   - Navigation elements visible
   - Hero section renders
   - CTA buttons functional
   - Responsive design

2. **Documentation Navigation** (`docs-navigation.cy.ts`)
   - Sidebar navigation
   - Content rendering
   - Search functionality
   - Code examples
   - Mobile navigation

3. **Example Table Rendering** (`example-table.cy.ts`)
   - Table structure
   - Data display
   - Sorting functionality
   - Filtering capabilities
   - Pagination
   - Selection
   - Virtual scrolling
   - Column operations
   - Accessibility
   - Mobile compatibility

#### Custom Commands

```typescript
// Wait for table to load
cy.waitForTable();

// Navigate to section
cy.navigateToSection('examples');

// Select by data-cy attribute
cy.dataCy('hero-section');
```

#### Running E2E Tests

```bash
# In tableng-website directory

# Open Cypress Test Runner
npm run e2e:open

# Run tests headlessly
npm run e2e

# Run with CI server
npm run e2e:ci
```

## Continuous Integration

### GitHub Actions Workflows

#### Library CI (`.github/workflows/ci.yml`)

**Jobs:**
1. **Lint** - ESLint and Prettier checks
2. **Test** - Unit tests on Node 18 & 20
3. **Build** - Library compilation
4. **Compatibility** - Angular version compatibility
5. **Security** - npm audit and CodeQL
6. **Performance** - Bundle size checks
7. **Publish Check** - Dry run publishing

#### Website E2E CI (`.github/workflows/e2e-ci.yml`)

**Jobs:**
1. **E2E Tests** - Cross-browser testing
2. **Accessibility** - a11y validation
3. **Performance** - Lighthouse CI
4. **Visual Regression** - Screenshot comparison
5. **Mobile Tests** - Device-specific testing

### Branch Protection Rules

The following rules are enforced:

#### Required Status Checks
- ✅ Lint Code
- ✅ Run Tests (Node 18)
- ✅ Run Tests (Node 20)
- ✅ Build Library
- ✅ Angular Compatibility Check
- ✅ Security Audit
- ✅ Performance Tests

#### Protection Settings
- Require branches to be up to date
- Restrict pushes to main/develop
- Require pull request reviews
- Dismiss stale reviews on new commits
- Require review from code owners

#### Setting Up Branch Protection

1. Go to repository Settings → Branches
2. Add rule for `main` and `develop` branches
3. Enable "Require status checks to pass before merging"
4. Select required checks from CI workflows
5. Enable "Require up-to-date branches"

## Performance Monitoring

### Bundle Size Limits
- Main bundle: < 1MB
- Individual components: < 100KB
- Dependencies: Monitored for bloat

### Performance Tests
- Table rendering: < 100ms for 1000 rows
- Virtual scrolling: Smooth 60fps
- Memory usage: No leaks during operations

## Security

### Automated Security Checks
- npm audit for dependency vulnerabilities
- CodeQL for code analysis
- Dependabot for dependency updates

### Security Policies
- Regular dependency updates
- Vulnerability disclosure process
- Security-focused code reviews

## Deployment Gates

### Pre-deployment Checklist
- [ ] All CI checks passing
- [ ] Code coverage above thresholds
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit clean
- [ ] Documentation updated

### Deployment Process
1. Create pull request
2. Automated CI checks run
3. Code review by maintainers
4. Manual testing (if needed)
5. Merge to main/develop
6. Automated deployment (if configured)

## Troubleshooting

### Common Issues

**ESLint Errors**
```bash
# Auto-fix common issues
npm run lint:fix

# Check specific files
npx eslint projects/tableng/src/lib/**/*.ts
```

**Test Failures**
```bash
# Run tests in watch mode for debugging
npm run test:watch

# Run specific test file
npx jest projects/tableng/src/lib/components/table.component.spec.ts
```

**Coverage Below Threshold**
```bash
# Generate detailed coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

**E2E Test Issues**
```bash
# Debug mode
npx cypress open

# Run specific test
npx cypress run --spec "cypress/e2e/homepage.cy.ts"
```

### Getting Help

- Check the CI logs for detailed error messages
- Review the coverage report for missing tests
- Use `npm run quality:fix` to auto-fix common issues
- Run tests locally before pushing changes

## Contributing

When contributing to the project:

1. Run `npm run quality:check` before committing
2. Ensure tests cover new functionality
3. Update documentation for new features
4. Follow the existing code style
5. Add E2E tests for user-facing features

The QA setup is designed to maintain high code quality while providing fast feedback to developers. All tools are configured to work together seamlessly and provide comprehensive coverage of the codebase.
