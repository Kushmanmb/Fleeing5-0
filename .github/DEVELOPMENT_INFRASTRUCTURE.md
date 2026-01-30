# Development Infrastructure Guide

This guide explains how to use the development infrastructure set up for this project.

## Overview

The repository now includes:

1. **CI/CD Pipeline** - Automated testing and building with yarn
2. **Configuration Templates** - Reusable templates for documentation
3. **Coding Guidelines** - Comprehensive coding standards

## GitHub Actions Workflow

### CI/CD Pipeline (`ci.yml`)

The new CI/CD workflow includes:

- **Dependency Installation**: Uses `yarn install --frozen-lockfile` for consistent builds
- **Testing**: Runs both `yarn test` and `yarn test:verify`
- **Building**: Builds project with both the build script and webpack
- **Matrix Testing**: Tests on Node.js 18.x, 20.x, and 22.x
- **Artifact Upload**: Saves build artifacts for review

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. `lint-and-test` - Runs tests across multiple Node versions
2. `build` - Builds the project and uploads artifacts

### Existing Workflows

- **Node.js CI** (`node.js.yml`) - npm-based CI pipeline
- **Webpack Build** (`webpack.yml`) - Webpack-specific builds
- **GitHub Pages** (`pages.yml`) - Deploys to GitHub Pages

## Configuration Templates

Located in `.github/`, these templates help maintain consistency:

### TEMPLATE_ROLE.md

Use this template to define team roles. Includes:

- Role type and domain
- Key skill areas (technical, domain knowledge, soft skills)
- Responsibilities (primary and secondary)
- Authority level and reporting structure
- Success metrics and development path

**Example Use Cases:**
- Defining maintainer responsibilities
- Documenting contributor roles
- Clarifying code owner duties

### TEMPLATE_COMMUNICATION.md

Use this template for communication standards. Includes:

- Communication tone guidelines
- Language conventions (comments, commits, PRs, issues)
- Documentation references
- Response formats for reviews and discussions
- Meeting standards and feedback culture

**Example Use Cases:**
- Setting up code review guidelines
- Defining commit message standards
- Establishing PR description formats

### TEMPLATE_GUIDELINES.md

Use this template for general development guidelines. Includes:

- Project overview and technology stack
- Development goals (primary and secondary)
- Code organization and directory structure
- Architectural guidelines and patterns
- Performance, testing, and security guidelines

**Example Use Cases:**
- Creating project-specific guidelines
- Documenting feature development standards
- Establishing module-specific practices

## Using the Templates

1. **Copy the template** to a new file
2. **Replace placeholders** with actual values
   - Placeholders are in the format: `[PLACEHOLDER_NAME]`
3. **Customize content** to fit your specific needs
4. **Save** to the appropriate location:
   - Team/role docs: `.github/` or `docs/`
   - Project guidelines: Root directory or `docs/`

### Example: Creating a Maintainer Role Document

```bash
cp .github/TEMPLATE_ROLE.md .github/roles/MAINTAINER.md
# Edit MAINTAINER.md, replacing placeholders
```

## Coding Guidelines

The `CODING_GUIDELINES.md` file provides comprehensive coding standards:

### Quick Reference

**Language Conventions:**
- Use `const` and `let`, never `var`
- Use template literals for string interpolation
- Prefer arrow functions for callbacks
- Use async/await for asynchronous code

**Performance:**
- Cache DOM references
- Batch DOM updates with DocumentFragment
- Use early exit in loops
- Avoid nested loops when possible

**Style:**
- 2-space indentation
- Lines under 100 characters
- Meaningful variable names
- JSDoc comments for public APIs

**Testing:**
- Follow Arrange-Act-Assert pattern
- Test edge cases
- Use descriptive test names

**Security:**
- Validate all user input
- Never commit secrets
- Keep dependencies updated
- Handle errors without exposing sensitive data

### Topics Covered

1. **Language Conventions** - JavaScript/ES6+ best practices
2. **Code Patterns** - Design patterns and anti-patterns
3. **Architectural Guidelines** - Structure and organization
4. **Performance Optimization** - DOM, loops, memory management
5. **Style Guide** - Formatting and commenting standards
6. **Testing Standards** - Test structure and coverage
7. **Security Best Practices** - Input validation, secrets, dependencies
8. **Documentation Standards** - README, code docs, inline docs

## Yarn Support

The project now supports both npm and yarn:

### Using Yarn

```bash
# Install dependencies
yarn install

# Run tests
yarn test
yarn test:verify

# Build project
yarn build
yarn webpack

# Other commands
yarn faucet
yarn verify
```

### Using NPM (Still Supported)

```bash
# Install dependencies
npm install

# Run tests
npm test
npm run test:verify

# Build project
npm run build
npm run webpack
```

## Best Practices

### For Contributors

1. **Read the coding guidelines** before contributing
2. **Follow the templates** when creating documentation
3. **Run tests locally** before pushing: `yarn test`
4. **Build locally** to catch issues: `yarn build`
5. **Write clear commit messages** following project standards

### For Maintainers

1. **Keep templates updated** as project evolves
2. **Review CI/CD pipelines** regularly
3. **Update guidelines** when adding new patterns
4. **Document decisions** using the templates
5. **Share knowledge** through clear documentation

### For Code Reviewers

1. **Reference coding guidelines** in reviews
2. **Use consistent feedback** format (see TEMPLATE_COMMUNICATION.md)
3. **Check CI/CD status** before approving
4. **Verify tests pass** across all Node versions
5. **Ensure documentation** is updated with code changes

## Continuous Improvement

This infrastructure is meant to evolve:

- **Suggest improvements** to templates via issues/PRs
- **Propose new guidelines** as patterns emerge
- **Report workflow issues** if CI/CD needs adjustment
- **Share feedback** on what works and what doesn't

## Questions?

- Check the [README.md](README.md) for general project info
- Review [CODING_GUIDELINES.md](CODING_GUIDELINES.md) for coding standards
- See [OWNERSHIP.md](OWNERSHIP.md) for ownership information
- Open an issue for questions or improvements

## Summary

This infrastructure provides:
- ✅ Automated CI/CD with yarn support
- ✅ Reusable templates for consistency
- ✅ Comprehensive coding guidelines
- ✅ Clear documentation standards
- ✅ Best practices for all team members

Follow these guidelines and use these tools to maintain code quality and consistency across the project.
