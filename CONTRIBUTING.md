# Contributing to kywmahmb

Thank you for your interest in contributing to kywmahmb! This document provides guidelines for contributing to the project.

## Git Workflow

We follow a feature branch workflow to keep the main branch stable and production-ready.

### Branch Strategy

- **main**: The primary branch containing production-ready code. All changes are merged here via pull requests.
- **feature branches**: Create feature branches from `main` for new features, bug fixes, or improvements.

### Branch Naming Convention

Use descriptive branch names that indicate the purpose of your changes:

- `feature/description` - For new features (e.g., `feature/add-multiplier`)
- `bugfix/description` - For bug fixes (e.g., `bugfix/fix-spin-animation`)
- `docs/description` - For documentation changes (e.g., `docs/update-readme`)
- `refactor/description` - For code refactoring (e.g., `refactor/optimize-loops`)
- `test/description` - For test additions or improvements (e.g., `test/add-bonus-tests`)

### Making Changes

1. **Fork and Clone** (for external contributors):
   ```bash
   git clone https://github.com/YOUR_USERNAME/kywmahmb.git
   cd kywmahmb
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**:
   - Write clean, well-documented code
   - Follow the existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**:
   ```bash
   npm install
   npm run build
   npm test
   ```

5. **Commit Your Changes**:
   - Write clear, descriptive commit messages
   - Use the present tense ("Add feature" not "Added feature")
   - Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
   - Reference issues and pull requests when relevant

   ```bash
   git add .
   git commit -m "Add multiplier feature to bonus rounds"
   ```

6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**:
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with details about your changes
   - Link any related issues

### Commit Message Guidelines

Write clear commit messages that explain what and why:

**Good commit messages:**
```
Add bonus multiplier feature

Implements a 2x multiplier for bonus rounds when PRISONER,
COP, and ROBBER symbols appear on their respective reels.
Updates test suite to verify multiplier logic.
```

**Avoid:**
```
Fixed stuff
WIP
Update
```

### Pull Request Process

1. **Before Opening a PR**:
   - Ensure all tests pass
   - Run the build process
   - Update documentation if needed
   - Rebase on latest main if necessary

2. **PR Description**:
   - Clearly describe what changes you made and why
   - Include any relevant context or background
   - List any breaking changes
   - Add screenshots for UI changes

3. **Code Review**:
   - Address reviewer feedback promptly
   - Make requested changes in new commits
   - Keep the PR focused and avoid scope creep

4. **After Approval**:
   - The maintainers will merge your PR
   - Delete your feature branch after merge

### Keeping Your Branch Updated

If the main branch has been updated since you created your branch:

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main
# Resolve any conflicts
git push --force-with-lease origin feature/your-feature-name
```

## Code Style

- Use ES6+ JavaScript syntax
- Use `const` and `let` instead of `var`
- Use template literals for string interpolation
- Keep functions focused and single-purpose
- Add comments only for complex logic
- Follow performance best practices outlined in README.md

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Tests are located in `test.js`
- Run tests with `npm test`

## Performance Considerations

This project emphasizes performance optimization. When contributing:

1. Cache DOM elements to avoid repeated lookups
2. Use DocumentFragment for batch DOM operations
3. Avoid unnecessary loops and function calls
4. Profile your changes if they affect performance-critical code

## Documentation

- Update README.md if you add new features or change setup steps
- Document any new configuration options
- Add JSDoc comments for complex functions
- Update OWNERSHIP.md if adding third-party code or assets

## Reporting Issues

When reporting issues:

1. Use GitHub Issues
2. Provide a clear description
3. Include steps to reproduce
4. Specify your environment (OS, Node.js version, browser)
5. Include error messages or screenshots if applicable

## Questions?

If you have questions about contributing:

1. Check existing issues and pull requests
2. Review the README.md and OWNERSHIP.md
3. Open a new issue for discussion

Thank you for contributing to kywmahmb!
