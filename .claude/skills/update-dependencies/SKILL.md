---
name: update-dependencies
description: Safely update pnpm dependencies, Node.js, and tool versions with testing and verification. Use when updating packages, managing dependency versions, updating .tool-versions, or keeping dependencies current.
---

# Update pnpm Dependencies Safely

You are helping update dependencies in this pnpm project. Follow these steps carefully to ensure safe updates.

**Usage**: `/update-dependencies [package-name]` or `/update-dependencies all` or `/update-dependencies tools`

**Tools Used**: This skill uses Bash (pnpm, grep, cat, git, asdf, mise, npm, node), Read, Edit, Grep, Glob, WebSearch, and WebFetch tools.

## IMPORTANT: Tool Auto-Approval

When this skill runs, you should request auto-approval for the following tool patterns if prompted:
- `Bash(pnpm:*)` - All pnpm commands
- `Bash(grep:*)` - Grep commands for searching
- `Bash(cat:*)` - Reading files
- `Bash(git:*)` - Git commands for checking status
- `Bash(asdf:*)` - Version manager commands
- `Bash(mise:*)` - Alternative version manager
- `Bash(npm:*)` - NPM registry queries
- `Bash(node:*)` - Node version checks
- All file reading/editing tools (Read, Edit, Grep, Glob)
- Web tools for checking migration guides (WebSearch, WebFetch)

These are safe, read-only or reversible operations needed for the update process.

## Major Version Update Approval Workflow

**CRITICAL RULE**: Major version updates (e.g., 6.x → 7.x) REQUIRE explicit user approval.

### Example Workflow:

```
[Skill analyzes outdated packages]

Updates categorized:
✅ Patch/Minor (auto-update): @types/react, ai, isbot, dotenv, vercel, lucide-react
⚠️  Major (needs approval):
   - Prisma: 6.16.1 → 7.4.0
   - react-day-picker: 8.10.1 → 9.13.2

[Skill searches for migration guides]

Prisma 7.0 Breaking Changes:
- Requires driver adapters (@prisma/adapter-pg)
- New prisma.config.ts file required
- Database URL migration needed
- ESM module format

react-day-picker 9.0 Breaking Changes:
- Class names updated
- Selected prop now controlled
- date-fns dependency changed

❓ QUESTION FOR USER:
"I found major version updates with breaking changes:
1. Prisma (6.16.1 → 7.4.0) - Requires adapter setup and config migration
2. react-day-picker (8.10.1 → 9.13.2) - API changes for date selection

Should I proceed with these major updates? (yes/no/selective)"

[WAIT for user response]
[Only update approved packages]
```

## Current Project Context

- **Package Manager**: pnpm
- **Key Dependencies**: React Router, tRPC, Prisma, Vercel AI SDK
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Type Checking**: `pnpm ts-check`

## Safety-First Update Process

### Step 1: Assess Current State

1. **Check tool versions** (Node.js & pnpm):
```bash
cat .tool-versions
```

Current versions tracked:
- nodejs (managed by asdf/mise)
- pnpm (package manager)

2. Check for outdated packages:
```bash
pnpm outdated
```

3. Review current lock file status:
```bash
git status pnpm-lock.yaml
```

4. **CRITICAL**: Run baseline tests before any changes:
```bash
pnpm ts-check  # Type checking only (per AGENTS.md vibe coding)
```

### Step 1.5: Update Tool Versions (if needed)

Before updating packages, check if Node.js or pnpm versions need updating:

#### Check for newer Node.js versions:

Check https://nodejs.org/en/download for the latest LTS version of node

#### Check for newer pnpm versions:
```bash
# Check latest pnpm version
npm view pnpm version
```

**Update .tool-versions for pnpm:**
1. Read current version from `.tool-versions`
2. Check latest stable from npm registry
3. Update `.tool-versions` file:
```
nodejs <current-nodejs-version>
pnpm <new-pnpm-version>
```

**After updating .tool-versions:**
1. Install the new versions:
```bash
asdf install  # or mise install
```

2. Verify installation:
```bash
node --version  # Should match .tool-versions
pnpm --version  # Should match .tool-versions
```

3. Reinstall dependencies with new tool versions:
```bash
pnpm install
```

4. Run type checking to ensure compatibility:
```bash
pnpm ts-check
```

### Step 2: Categorize Updates (REQUIRED)

**CRITICAL**: Before performing any updates, you MUST categorize them by semantic version change:

1. **Parse `pnpm outdated` output** to identify:
   - **Patch updates** (e.g., 1.2.3 → 1.2.4): Bug fixes, safe to auto-update
   - **Minor updates** (e.g., 1.2.3 → 1.3.0): New features, usually safe to auto-update
   - **Major updates** (e.g., 1.2.3 → 2.0.0): Breaking changes, **REQUIRES USER APPROVAL**

2. **Group packages by update type**:
   ```
   Patch updates: <list>
   Minor updates: <list>
   Major updates: <list>
   ```

3. **For MAJOR updates**:
   - Search for migration guides using WebSearch
   - Summarize breaking changes
   - **ASK USER**: "The following packages have major version updates with potential breaking changes: [list]. Should I proceed with updating them?"
   - **WAIT for user approval** before updating any major version
   - Only update major versions the user explicitly approves

### Step 3: Update Strategy

Based on categorization and user approval:

#### Auto-Update: Patch and Minor Versions
Automatically update all patch and minor versions together:
```bash
# Update packages with patch/minor changes
pnpm update <package-1> <package-2> <package-3>
```

#### User Approval Required: Major Versions
For each major version update approved by the user:
```bash
# Check available versions
pnpm outdated <package-name>

# Update to specific major version
pnpm update <package-name>@<version>
```

**NEVER** auto-update major versions without explicit user approval.

#### All Dependencies ("all" or no arguments)
When updating all dependencies:
1. First categorize all outdated packages (Step 2)
2. Auto-update all patch/minor versions
3. Ask user approval for each major version update
4. Only update approved major versions

### Step 4: Review Changes

1. **Check lock file diff**:
```bash
git diff pnpm-lock.yaml
```

2. **Review package.json changes**:
```bash
git diff package.json
```

3. **Check for peer dependency warnings**: Look at pnpm update output

### Step 5: Critical Checks

**For AI-related packages** (openai, @ai-sdk/*, vercel/ai):
- Check migration guides in official docs
- Verify API compatibility with existing AI utilities
- Test food processing and meal suggestion features

**For React Router updates**:
- Review breaking changes in routing
- Check SSR compatibility
- Verify tRPC integration still works

**For Prisma updates**:
- Check schema compatibility
- Review migration requirements
- Verify database connection patterns

**For TypeScript updates**:
- Run `pnpm ts-check` immediately
- Review any new strict mode errors
- Check compatibility with React and other type deps

### Step 6: Verification (Only Type Checking per AGENTS.md)

Per the project's "vibe coding" guidelines, **only run type checking automatically**:

```bash
pnpm ts-check
```

**Do NOT run** `pnpm build` or `pnpm test` unless explicitly told to by the user.

If type checking passes, inform the user that:
- Types are valid
- They should run `pnpm test` manually if needed
- They should test the app functionality manually

### Step 7: Document Changes

Create a brief summary for the user:
- What was updated (package names and versions)
- Any breaking changes to be aware of
- Recommendations for manual testing
- Whether migration steps are needed

## Breaking Change Checklist

When updating major versions, check:

- [ ] **React 19+**: New hooks API, automatic batching changes
- [ ] **React Router 7+**: Route convention changes, SSR updates
- [ ] **Vercel AI SDK**: Stream API changes, tool calling updates
- [ ] **TypeScript 5+**: New strict checks, module resolution changes
- [ ] **Prisma**: Schema syntax, client generation changes
- [ ] **Vite**: Config format, plugin API changes

## Common Scenarios

### Scenario: Security vulnerability fix
```bash
# Update specific vulnerable package
pnpm update <package-name>@latest

# Check for remaining vulnerabilities
pnpm audit
```

### Scenario: React ecosystem update
```bash
# Update React and related packages together
pnpm update react react-dom @types/react @types/react-dom

# Check React Router compatibility
pnpm outdated react-router
```

### Scenario: AI SDK updates
```bash
# Update AI-related packages together
pnpm update @ai-sdk/openai ai vercel

# Verify environment config still matches
# Check app/server/ai/ files for compatibility
```

### Scenario: Node.js or pnpm version update
```bash
# 1. Check current versions
cat .tool-versions

# 2. Find latest LTS Node.js or stable pnpm version
asdf list all nodejs | grep lts | tail -5
npm view pnpm version

# 3. Update .tool-versions file manually or with Edit tool

# 4. Install new versions
asdf install  # or mise install

# 5. Verify
node --version
pnpm --version

# 6. Reinstall dependencies
pnpm install

# 7. Verify everything works
pnpm ts-check
```

## Rollback Instructions

If updates cause issues:

```bash
# Restore previous lock file
git checkout pnpm-lock.yaml package.json

# Reinstall previous versions
pnpm install --frozen-lockfile
```

## Post-Update Recommendations

After successful update, suggest to the user:

1. **Manual testing**:
   - Test AI food parsing (text and image)
   - Test meal suggestion generation
   - Test diary CRUD operations
   - Test authentication flow

2. **Optional full validation** (user's choice):
   - `pnpm test` - Run full test suite
   - `pnpm build` - Verify production build
   - `pnpm dev` - Test dev server

3. **Commit changes**:
   ```bash
   # If only packages were updated
   git add package.json pnpm-lock.yaml
   git commit -m "chore: update dependencies"

   # If .tool-versions was also updated
   git add package.json pnpm-lock.yaml .tool-versions
   git commit -m "chore: update dependencies and tool versions"
   ```

## When $ARGUMENTS is provided:

Focus the update on: **$ARGUMENTS**

Apply all safety steps above, but narrow the scope to the specified package(s).
