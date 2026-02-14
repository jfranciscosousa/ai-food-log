# Claude Code Configuration

This directory contains configuration for Claude Code (AI assistant) integration.

## MCP Integration

The project is configured with MCP (Model Context Protocol) servers for automated testing and development workflows.

### Configured MCP Servers

1. **playwright** - Official Playwright MCP server
   - Provides automated browser testing capabilities
   - Allows Claude to run, debug, and fix e2e tests
   - Environment: Chromium by default

2. **e2e-tests** - Quick test runner
   - Runs Playwright tests without rebuilding
   - Useful for rapid test iteration

### How to Use

Once MCP servers are connected (happens automatically in VSCode), Claude can:

- ✅ Run e2e tests automatically
- ✅ Analyze test failures
- ✅ Fix failing tests
- ✅ Generate new test cases
- ✅ Debug test issues

### Available Commands

After MCP servers are loaded, you can ask Claude to:

```
"Run the e2e tests"
"Fix the failing profile test"
"Generate a test for the settings page"
"Debug why the login test is failing"
```

### Configuration Files

- **`.mcp.json`** - Team-shared MCP server configuration (committed to git)
- **`.mcp.local.json`** - Personal MCP overrides (gitignored, optional)
- **`settings.json`** - Claude Code permissions and settings

### Reloading MCP Servers

If you update `.mcp.json`, reload VSCode or use the command:
- VSCode: Reload Window (Cmd+Shift+P → "Reload Window")
- Or disconnect/reconnect Claude in the extension

### Permissions

The `settings.json` file grants Claude permission to:
- Run pnpm commands (add, test, build, ts-check)
- Run Playwright tests
- Use MCP tools
- Execute Prisma commands
- Use dotenv for environment variables

### Troubleshooting

If MCP tools aren't working:
1. Check that VSCode is reloaded after config changes
2. Verify `@playwright/mcp` is accessible (it's installed on-demand via npx)
3. Check the Output panel in VSCode → "Claude Code" for MCP connection logs
4. Ensure you're on the latest Claude Code extension version

### Security Note

The team-shared `.mcp.json` contains no secrets. All sensitive data (API keys, tokens) should go in `.env` files which are gitignored.
