# Clockify MCP Server

[![smithery badge](https://smithery.ai/badge/@https-eduardo/clockify-mcp-server)](https://smithery.ai/server/@https-eduardo/clockify-mcp-server)

This MCP Server integrates with AI Tools to manage your time entries in Clockify, so you can register your time entries just sending an prompt to LLM.

## Using in Claude Desktop

### Installing via Smithery

To install clockify-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@https-eduardo/clockify-mcp-server):

```bash
npx -y @smithery/cli install @https-eduardo/clockify-mcp-server --client claude
```

### Installing Manually

Before anything, make sure you have Node.js and npm installed on your machine.

First, clone the project and change directory to it.

Then install the dependencies

`npm i`

Then install tsx globally

`npm i -g tsx`

Create a Clockify API key:

- Log in to Clockify
- Click on your profile icon in the top right
- Click on Preferences
- Go to the Advanced tab
- Select Manage API keys
- Create a new one

Then insert the MCP server in `claude_desktop_config.json`, replacing `ABSOLUTE_PATH` with the path to the cloned project and `YOUR_CLOCKIFY_API_TOKEN_HERE` with your API key

```json
{
  "mcpServers": {
    "clockify-time-entries": {
      "command": "tsx",
      "args": ["ABSOLUTE_PATH/src/index.ts", "--local"],
      "env": {
        "CLOCKIFY_API_URL": "https://api.clockify.me/api/v1",
        "CLOCKIFY_API_TOKEN": "YOUR_CLOCKIFY_API_TOKEN_HERE"
      }
    }
  }
}
```

Tip: you can find `claude_desktop_config.json` here:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
