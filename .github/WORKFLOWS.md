# GitHub Workflows Documentation

This repository uses GitHub Actions for continuous integration, security scanning, and release automation.

## Available Workflows

### CI Workflow (`ci.yml`)
**Triggers:** Push to main branch, Pull requests to main branch

**Purpose:** Comprehensive continuous integration testing across multiple Node.js versions.

**Steps:**
1. Checks out the code
2. Sets up Node.js (versions 18.x, 20.x, 22.x)
3. Installs dependencies with `npm ci`
4. Runs test suite with `npm test`
5. Builds project with `npm run build`
6. Builds webpack bundle with `npm run webpack`
7. Uploads build artifacts (on Node.js 22.x only)

**Artifacts:** Build artifacts (dist/, bundle.js) are retained for 7 days

### CodeQL Analysis (`codeql.yml`)
**Triggers:** Push to main branch, Pull requests to main branch, Weekly schedule (Mondays at midnight)

**Purpose:** Automated security vulnerability scanning for JavaScript code.

**Steps:**
1. Checks out the code
2. Initializes CodeQL for JavaScript
3. Autobuilds the project
4. Performs CodeQL security analysis
5. Uploads results to GitHub Security tab

### Dependency Review (`dependency-review.yml`)
**Triggers:** Pull requests to main branch

**Purpose:** Reviews dependency changes in pull requests for security vulnerabilities.

**Configuration:**
- Fails on moderate or higher severity vulnerabilities
- Provides detailed report on vulnerable dependencies
- Helps prevent supply chain attacks

### Release Workflow (`release.yml`)
**Triggers:** Push of version tags (e.g., v1.0.0, v2.1.3)

**Purpose:** Automates the release process when version tags are pushed.

**Steps:**
1. Checks out the code
2. Sets up Node.js 22.x
3. Installs dependencies
4. Runs tests to ensure stability
5. Builds project and webpack bundle
6. Creates release archive (tar.gz)
7. Creates GitHub Release with auto-generated notes
8. Attaches build artifacts to the release

**Usage:**
```bash
# Create and push a version tag to trigger release
git tag v1.0.0
git push origin v1.0.0
```

## Workflow Status Badges

The README includes status badges that show the current status of the CI and CodeQL workflows:
- ![CI Badge](https://github.com/Kushmanmb/kywmahmb/actions/workflows/ci.yml/badge.svg)
- ![CodeQL Badge](https://github.com/Kushmanmb/kywmahmb/actions/workflows/codeql.yml/badge.svg)

## Workflow Improvements Made

1. **Consolidated Workflows**: Merged `node.js.yml` and `webpack.yml` into a single comprehensive `ci.yml` workflow
2. **Added Security**: Implemented CodeQL analysis and dependency review
3. **Release Automation**: Created automated release workflow for version tags
4. **Build Artifacts**: Added artifact uploads for build outputs
5. **Better Naming**: Renamed workflows for clarity
6. **Status Badges**: Added badges to README for visibility

## Best Practices Implemented

- **Matrix Testing**: Tests across multiple Node.js versions (18.x, 20.x, 22.x)
- **Dependency Caching**: Uses npm caching to speed up workflow runs
- **Clean Installs**: Uses `npm ci` for reproducible builds
- **Security First**: Runs CodeQL and dependency reviews automatically
- **Artifact Management**: Uploads and retains build artifacts
- **Release Automation**: Streamlines the release process
