# GitHub Repository Rulesets

This directory contains JSON configuration files for GitHub repository rulesets. These rulesets enforce branch protection rules and best practices for the repository.

## Available Rulesets

### 1. Main Branch Protection (`main-branch-protection.json`)

Protects the `main` branch with strict rules:

- **Branch Deletion**: Prevented
- **Force Pushes**: Not allowed (non-fast-forward updates blocked)
- **Pull Request Requirements**:
  - Requires code owner review
  - At least 1 approval required
  - Dismiss stale reviews on push
  - All review threads must be resolved
- **Status Checks**: All CI/CD checks must pass (all Node.js versions)
- **Bypass**: Organization admins can bypass these rules

### 2. Develop Branch Protection (`develop-branch-protection.json`)

Protects the `develop` branch with moderate rules:

- **Branch Deletion**: Prevented
- **Force Pushes**: Not allowed
- **Pull Request Requirements**:
  - At least 1 approval required
  - Dismiss stale reviews on push
  - Code owner review not required
- **Status Checks**: Key CI/CD checks must pass (Node.js 20.x)
- **Bypass**: Organization admins can bypass these rules

### 3. Release Branches Protection (`release-branches-protection.json`)

Protects all `release/*` branches with the strictest rules:

- **Branch Deletion**: Prevented
- **Force Pushes**: Not allowed
- **Pull Request Requirements**:
  - Requires code owner review
  - Requires approval from last push
  - At least 2 approvals required
  - Dismiss stale reviews on push
  - All review threads must be resolved
- **Status Checks**: All CI/CD checks must pass (all Node.js versions)
- **Commit Message Pattern**: Must follow semantic commit format
  - Example: `feat: add new feature`, `fix(api): resolve bug`
- **Bypass**: Organization admins can bypass these rules

## How to Use These Rulesets

### Method 1: Import via GitHub UI

1. Go to your repository **Settings**
2. Navigate to **Rules** → **Rulesets** in the left sidebar
3. Click **New ruleset** → **Import a ruleset**
4. Upload one of the JSON files from this directory
5. Review the configuration and click **Create**

### Method 2: Manual Configuration

You can also manually create rulesets in the GitHub UI by following the configuration in these JSON files.

## Ruleset Structure

Each ruleset JSON file contains:

- **name**: Display name of the ruleset
- **target**: What the ruleset applies to (`branch` or `tag`)
- **enforcement**: `active` (enabled) or `evaluate` (monitoring only)
- **conditions**: Branch/tag patterns to match
- **rules**: List of protection rules to enforce
- **bypass_actors**: Who can bypass the rules

## Common Rules Explained

### deletion
Prevents the branch from being deleted.

### non_fast_forward
Prevents force pushes and history rewrites.

### pull_request
Requires pull requests for changes with specific review requirements:
- `require_code_owner_review`: Code owner must review
- `required_approving_review_count`: Minimum number of approvals
- `dismiss_stale_reviews_on_push`: New pushes dismiss old approvals
- `required_review_thread_resolution`: All comments must be resolved

### required_status_checks
Specifies which CI/CD checks must pass before merging:
- `strict_required_status_checks_policy`: Branch must be up-to-date
- `required_status_checks`: List of check names that must pass

### commit_message_pattern
Enforces commit message format using regular expressions.

## Customizing Rulesets

To modify a ruleset:

1. Edit the JSON file in this directory
2. Update the repository's ruleset via the GitHub UI
3. Or re-import the modified JSON file

### Adjusting Status Checks

The `integration_id: 15368` refers to GitHub Actions. To require different checks, modify the `context` field to match your workflow job names.

### Changing Approval Requirements

Adjust these parameters in the `pull_request` rule:
- `required_approving_review_count`: 0-6 (number of required approvals)
- `require_code_owner_review`: `true` or `false`
- `require_last_push_approval`: `true` or `false`

## Testing Rulesets

Before activating a ruleset:

1. Set `"enforcement": "evaluate"` to monitor without blocking
2. Review the ruleset activity in Settings → Rules → Rulesets
3. Once confident, change to `"enforcement": "active"`

## Best Practices

1. **Start with evaluate mode** - Test rulesets before enforcing them
2. **Communicate changes** - Let your team know about new rules
3. **Document exceptions** - If bypassing rules, document why
4. **Review regularly** - Update rulesets as workflows evolve
5. **Keep backups** - Save JSON files in version control (this directory)

## Additional Resources

- [GitHub Docs: Creating rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [GitHub Ruleset Recipes](https://github.com/github/ruleset-recipes)
- [Managing rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository)

## Questions?

For questions or issues with these rulesets, please:
- Open an issue in this repository
- Consult the [GitHub Rulesets documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- Review the repository's [Development Infrastructure Guide](../DEVELOPMENT_INFRASTRUCTURE.md)
