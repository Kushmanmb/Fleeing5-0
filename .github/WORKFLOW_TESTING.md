# Path-Based Workflow Testing Guide

This document explains how to test the path-based workflows in this repository.

## Testing Approach

The workflows are designed to trigger only when relevant files are changed. Below are test scenarios to verify this behavior.

## Test Scenarios

### Test 1: Modify Game Source Code
```bash
# Make a change to game code
echo "// Test comment" >> src/main.js
git add src/main.js
git commit -m "Test: Update game code"
git push
```

**Expected Workflows to Run:**
- ✓ Game CI
- ✓ Webpack Build CI
- ✓ Node.js CI
- ✓ NodeJS with Webpack
- ✓ Deploy to GitHub Pages (on main branch)

**Expected Workflows to Skip:**
- ✗ Faucet CI
- ✗ Documentation CI
- ✗ Workflow Validation

### Test 2: Modify Faucet Code
```bash
# Make a change to faucet
echo "// Test comment" >> faucet.js
git add faucet.js
git commit -m "Test: Update faucet code"
git push
```

**Expected Workflows to Run:**
- ✓ Faucet CI

**Expected Workflows to Skip:**
- ✗ Game CI
- ✗ Webpack Build CI
- ✗ Node.js CI
- ✗ NodeJS with Webpack
- ✗ Deploy to GitHub Pages
- ✗ Documentation CI
- ✗ Workflow Validation

### Test 3: Update Documentation
```bash
# Make a change to documentation
echo "" >> README.md
git add README.md
git commit -m "Test: Update documentation"
git push
```

**Expected Workflows to Run:**
- ✓ Documentation CI

**Expected Workflows to Skip:**
- ✗ Game CI
- ✗ Webpack Build CI
- ✗ Node.js CI
- ✗ NodeJS with Webpack
- ✗ Deploy to GitHub Pages
- ✗ Faucet CI
- ✗ Workflow Validation

### Test 4: Update Workflow Files
```bash
# Make a change to workflow
echo "# comment" >> .github/workflows/game-ci.yml
git add .github/workflows/game-ci.yml
git commit -m "Test: Update workflow"
git push
```

**Expected Workflows to Run:**
- ✓ Workflow Validation

**Expected Workflows to Skip:**
- ✗ Game CI
- ✗ Webpack Build CI
- ✗ Node.js CI
- ✗ NodeJS with Webpack
- ✗ Deploy to GitHub Pages
- ✗ Faucet CI
- ✗ Documentation CI

### Test 5: Update Dependencies
```bash
# Make a change to package.json
npm install --save-dev prettier
git add package.json package-lock.json
git commit -m "Test: Update dependencies"
git push
```

**Expected Workflows to Run:**
- ✓ Game CI
- ✓ Webpack Build CI
- ✓ Node.js CI
- ✓ NodeJS with Webpack
- ✓ Deploy to GitHub Pages (on main branch)
- ✓ Faucet CI

**Expected Workflows to Skip:**
- ✗ Documentation CI
- ✗ Workflow Validation

## Verifying Results

After pushing changes, check the Actions tab in GitHub:
1. Go to https://github.com/Kushmanmb/kywmahmb/actions
2. Verify that only the expected workflows are running
3. Check that skipped workflows show no new runs

## Path Filter Patterns

Here's a reference of what triggers each workflow:

| File Pattern | Triggered Workflows |
|--------------|-------------------|
| `src/**` | Game CI, Webpack Build CI, Node.js CI, NodeJS with Webpack, Pages |
| `faucet.js` | Faucet CI |
| `.env.example` | Faucet CI |
| `test.js` | Game CI, Node.js CI |
| `build.js` | Game CI, Node.js CI, Pages |
| `webpack.config.js` | Webpack Build CI, NodeJS with Webpack |
| `*.md` | Documentation CI |
| `CODEOWNERS` | Documentation CI |
| `.github/workflows/**` | Workflow Validation |
| `package.json` | All except Documentation CI and Workflow Validation |

## Benefits Verification

To verify the benefits of path-based workflows:

1. **Check Workflow Run Time**: Compare the total execution time before and after implementing path filters
2. **Monitor Action Minutes**: Path-based triggers should reduce overall GitHub Actions minutes consumed
3. **Review Pull Request Checks**: PRs should show fewer required checks based on changed files
4. **Observe Parallel Execution**: Multiple independent workflows can run simultaneously

## Troubleshooting

If workflows don't trigger as expected:

1. **Check YAML Syntax**: Run `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/WORKFLOW.yml'))"`
2. **Verify Path Patterns**: Ensure the file path matches the pattern in the workflow
3. **Check Branch Name**: Workflows are configured for `main` branch
4. **Review Workflow Logs**: Check the Actions tab for error messages
5. **Test Locally**: Use `act` tool to test workflows locally: https://github.com/nektos/act

## Manual Testing with Act

To test workflows locally without pushing:

```bash
# Install act (if not already installed)
# https://github.com/nektos/act

# Test a specific workflow
act -W .github/workflows/game-ci.yml

# List all available workflows
act -l

# Run workflows that would be triggered by a push
act push
```

## Continuous Monitoring

Set up monitoring to track:
- Number of workflow runs per day
- Average execution time per workflow
- Success/failure rates
- Action minutes consumed

This helps identify if path-based triggers are effectively reducing unnecessary builds.
