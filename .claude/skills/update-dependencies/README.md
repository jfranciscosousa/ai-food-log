# Update Dependencies Skill

A comprehensive skill for safely updating dependencies, Node.js, and pnpm versions in this project.

## What It Does

This skill helps you:
- Update npm packages via pnpm
- Update Node.js and pnpm versions in `.tool-versions`
- Verify updates with type checking
- Follow the project's "vibe coding" philosophy (types only, no auto builds/tests)

## How to Use

### Invoke the skill:

```bash
/update-dependencies                    # Update all packages
/update-dependencies react              # Update specific package
/update-dependencies all                # Update everything
/update-dependencies tools              # Update .tool-versions (Node.js/pnpm)
```

### Or ask naturally:

- "Update our dependencies safely"
- "Check if we have any outdated packages"
- "Update Node.js and pnpm versions"
- "Help me update the AI SDK packages"

## What the Skill Does

1. **Checks current state**: Looks at `.tool-versions`, `pnpm outdated`, and git status
2. **Updates safely**: Uses `pnpm update` with appropriate strategies
3. **Reviews changes**: Shows diffs in `package.json` and `pnpm-lock.yaml`
4. **Runs type checking**: Only `pnpm ts-check` per AGENTS.md vibe coding
5. **Provides recommendations**: Suggests manual testing and next steps

## Files in This Skill

- `SKILL.md` - Main skill instructions with step-by-step process
- `examples/common-patterns.md` - Reference guide for common update scenarios
- `README.md` - This file

## .tool-versions Integration

The skill automatically:
- Checks current Node.js and pnpm versions from `.tool-versions`
- Helps find latest LTS/stable versions
- Updates `.tool-versions` file when requested
- Verifies installation after updates
- Recommends `pnpm install` to sync dependencies

Current tool versions managed:
- `nodejs` - Runtime environment (currently 24.11.1)
- `pnpm` - Package manager (currently 10.24.0)

## Safety Features

- Always checks current state before making changes
- Runs type checking to verify compatibility
- Never runs builds or tests automatically (respects "vibe coding")
- Provides rollback instructions if something goes wrong
- Warns about breaking changes in major version updates
- Recommends manual testing for critical features

## Key Project Dependencies

The skill knows about your tech stack:
- React Router (full-stack framework)
- tRPC (API layer)
- Prisma (database ORM)
- Vercel AI SDK (AI integration)
- TypeScript, Vite, Vitest, Playwright

## Examples

### Update a single package
```
/update-dependencies react
```

### Update AI packages
```
/update-dependencies ai @ai-sdk/openai
```

### Update Node.js version
```
/update-dependencies tools
```
Then follow the prompts to specify which tool version to update.

### Interactive update mode
The skill will suggest using `pnpm update --interactive` for full control over which packages to update.
