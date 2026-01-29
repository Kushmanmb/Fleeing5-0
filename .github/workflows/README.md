# GitHub Actions Workflows

This directory contains GitHub Actions workflows that are triggered based on file paths to optimize CI/CD performance. Each workflow only runs when relevant files are changed.

## Path-Based Workflows

### Game CI (`game-ci.yml`)
**Triggers on changes to:**
- `src/**` - Game source files
- `test.js` - Game tests
- `build.js` - Build script
- `package.json`, `package-lock.json` - Dependencies

**What it does:**
- Tests on Node.js 18.x, 20.x, 22.x
- Installs dependencies with `npm ci`
- Builds the game with `npm run build`
- Runs tests with `npm test`
- Verifies dist directory and output files

### Faucet CI (`faucet-ci.yml`)
**Triggers on changes to:**
- `faucet.js` - Faucet server code
- `.env.example` - Environment configuration template
- `package.json`, `package-lock.json` - Dependencies

**What it does:**
- Tests on Node.js 18.x, 20.x, 22.x
- Validates JavaScript syntax with `node -c`
- Checks for required environment variables in `.env.example`
- Ensures INFURA_PROJECT_ID, PRIVATE_KEY, and USDC_CONTRACT_ADDRESS are documented

### Webpack Build CI (`webpack-build-ci.yml`)
**Triggers on changes to:**
- `src/**` - Source files to bundle
- `webpack.config.js` - Webpack configuration
- `package.json`, `package-lock.json` - Dependencies

**What it does:**
- Tests on Node.js 18.x, 20.x, 22.x
- Builds with Webpack using `npm run webpack`
- Verifies webpack output bundle is created

### Documentation CI (`docs-ci.yml`)
**Triggers on changes to:**
- `*.md` - Markdown documentation files
- `CODEOWNERS` - Code ownership file

**What it does:**
- Validates markdown files reference existing files
- Checks CODEOWNERS file format and content
- Ensures documentation consistency

### Node.js CI (`node.js.yml`)
**Triggers on changes to:**
- `src/**` - Game source files
- `test.js` - Tests
- `build.js` - Build script
- `package.json`, `package-lock.json` - Dependencies
- `.github/workflows/node.js.yml` - Workflow file itself

**What it does:**
- Original CI workflow with path filters added
- Tests on Node.js 18.x, 20.x, 22.x
- Runs build and test commands

### Webpack (`webpack.yml`)
**Triggers on changes to:**
- `src/**` - Source files
- `webpack.config.js` - Webpack configuration
- `package.json`, `package-lock.json` - Dependencies
- `.github/workflows/webpack.yml` - Workflow file itself

**What it does:**
- Original webpack workflow with path filters added
- Tests on Node.js 18.x, 20.x, 22.x
- Builds with Webpack

### GitHub Pages Deployment (`pages.yml`)
**Triggers on changes to:**
- `src/**` - Game source files
- `build.js` - Build script
- `package.json`, `package-lock.json` - Dependencies
- `.github/workflows/pages.yml` - Workflow file itself
- Manual trigger via `workflow_dispatch`

**What it does:**
- Builds the game
- Deploys to GitHub Pages
- Only deploys when game files change

### Workflow Validation (`workflow-validation.yml`)
**Triggers on changes to:**
- `.github/workflows/**` - Any workflow file

**What it does:**
- Validates YAML syntax of all workflow files
- Lists all available workflows
- Documents workflow triggers and path filters

## Benefits of Path-Based Workflows

1. **Performance**: Workflows only run when relevant files change, reducing CI/CD execution time
2. **Resource Efficiency**: Saves GitHub Actions minutes by avoiding unnecessary builds
3. **Faster Feedback**: Developers get faster feedback on their specific changes
4. **Clear Separation**: Each component (game, faucet, docs) has its own CI pipeline
5. **Parallel Execution**: Multiple workflows can run in parallel for different path changes

## Workflow Triggers Summary

| Workflow | Game Files | Faucet | Webpack Config | Docs | Dependencies |
|----------|------------|--------|----------------|------|--------------|
| game-ci.yml | ✓ | ✗ | ✗ | ✗ | ✓ |
| faucet-ci.yml | ✗ | ✓ | ✗ | ✗ | ✓ |
| webpack-build-ci.yml | ✓ | ✗ | ✓ | ✗ | ✓ |
| docs-ci.yml | ✗ | ✗ | ✗ | ✓ | ✗ |
| node.js.yml | ✓ | ✗ | ✗ | ✗ | ✓ |
| webpack.yml | ✓ | ✗ | ✓ | ✗ | ✓ |
| pages.yml | ✓ | ✗ | ✗ | ✗ | ✓ |
| workflow-validation.yml | ✗ | ✗ | ✗ | ✗ | ✗ |

## Examples

### Scenario 1: Changing Game Code
If you modify `src/main.js`:
- ✓ game-ci.yml runs
- ✓ webpack-build-ci.yml runs
- ✓ node.js.yml runs
- ✓ webpack.yml runs
- ✓ pages.yml runs (on push to main)
- ✗ faucet-ci.yml skipped
- ✗ docs-ci.yml skipped

### Scenario 2: Updating Faucet
If you modify `faucet.js`:
- ✓ faucet-ci.yml runs
- ✗ All other workflows skipped

### Scenario 3: Updating Documentation
If you modify `README.md`:
- ✓ docs-ci.yml runs
- ✗ All other workflows skipped

### Scenario 4: Updating Workflows
If you modify `.github/workflows/game-ci.yml`:
- ✓ workflow-validation.yml runs
- ✗ All other workflows skipped

## Testing Workflows Locally

To test workflow syntax locally:

```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/game-ci.yml'))"

# Check all workflows
for f in .github/workflows/*.yml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))"
done
```

## Modifying Workflows

When modifying workflows:

1. Update the `paths:` section to include relevant file patterns
2. Test YAML syntax before committing
3. Ensure the workflow has appropriate permissions
4. Document any new workflows in this README

## Path Filter Patterns

Common patterns used:
- `src/**` - All files in src directory and subdirectories
- `*.md` - All markdown files in root directory
- `package.json` - Specific file
- `.github/workflows/**` - All workflow files

For more information on path filters, see:
https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore
