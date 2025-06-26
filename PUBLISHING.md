# Publishing Guide

This guide explains how to publish the TableNG library to npm.

## Prerequisites

1. **npm Account**: You need an npm account with publishing permissions
2. **npm Token**: Generate an npm access token with publish permissions
3. **GitHub Repository**: Ensure the repository is properly configured

## Setup

### 1. npm Authentication

Create an npm access token:
1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to Access Tokens in your account settings
3. Generate a new token with "Automation" type
4. Add it as a repository secret named `NPM_TOKEN`

### 2. GitHub Repository Setup

Add the following secrets to your GitHub repository:
- `NPM_TOKEN`: Your npm automation token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Publishing Methods

### Method 1: Automated Publishing (Recommended)

The repository includes a GitHub Actions workflow that automatically publishes when you create a release tag.

1. **Update version in package.json**:
   ```bash
   npm run version:patch   # For patch releases (1.0.0 -> 1.0.1)
   npm run version:minor   # For minor releases (1.0.0 -> 1.1.0)
   npm run version:major   # For major releases (1.0.0 -> 2.0.0)
   ```

2. **Create and push a git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions will automatically**:
   - Run tests and linting
   - Build the library
   - Publish to npm
   - Create a GitHub release

### Method 2: Manual Publishing

For manual publishing or testing:

1. **Build the library**:
   ```bash
   npm run build:prod
   ```

2. **Test the package** (optional):
   ```bash
   npm run publish:dry-run
   ```

3. **Publish to npm**:
   ```bash
   npm run publish:lib
   ```

## Pre-Release Checklist

Before publishing a new version:

- [ ] Update version number in `projects/tableng/package.json`
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Ensure all tests pass: `npm run test:ci`
- [ ] Ensure linting passes: `npm run lint`
- [ ] Build successfully: `npm run build:prod`
- [ ] Review the package contents: `npm run pack`

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

### Version Examples

- `1.0.0` → `1.0.1`: Bug fixes
- `1.0.0` → `1.1.0`: New features (backwards compatible)
- `1.0.0` → `2.0.0`: Breaking changes

## Release Process

1. **Prepare the release**:
   - Update version numbers
   - Update changelog
   - Commit changes

2. **Create release tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Monitor the release**:
   - Check GitHub Actions for successful build
   - Verify package appears on npmjs.com
   - Test installation in a separate project

## Beta/Pre-release Versions

For beta releases:

1. **Update version with beta tag**:
   ```json
   {
     "version": "1.1.0-beta.1"
   }
   ```

2. **Publish with beta tag**:
   ```bash
   npm publish --tag beta
   ```

3. **Users can install beta versions**:
   ```bash
   npm install tableng@beta
   ```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your npm token has publish permissions
2. **Version Already Exists**: Increment the version number
3. **Build Failures**: Check TypeScript compilation errors
4. **Missing Files**: Review `.npmignore` and `files` in package.json

### Testing the Package

Test your package locally before publishing:

```bash
# Build and pack the library
npm run pack

# Install the packed version in a test project
npm install /path/to/tableng-1.0.0.tgz
```

## Post-Publication

After successful publication:

1. **Verify on npm**: Check [npmjs.com/package/tableng](https://npmjs.com/package/tableng)
2. **Update documentation**: Ensure installation instructions are current
3. **Announce the release**: Update community channels
4. **Monitor for issues**: Watch for bug reports or compatibility issues

## Support

If you encounter issues during publishing:

1. Check the [GitHub Actions logs](https://github.com/oskargembalski/tableng/actions)
2. Review npm's [publishing documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
3. Open an issue in the repository
