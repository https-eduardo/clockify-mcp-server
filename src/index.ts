import dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { api, SERVER_CONFIG } from "./config/api";
import {
  createEntryTool,
  deleteEntryTool,
  editEntryTool,
  listEntriesTool,
} from "./tools/entries";
import { findProjectTool } from "./tools/projects";
import { getCurrentUserTool } from "./tools/users";
import { findWorkspacesTool } from "./tools/workspaces";
import { createTagTool, getTagsTool } from "./tools/tags";
import { createTaskTool, updateTaskTool, deleteTaskTool, listTasksTool } from "./tools/tasks";
import { getHoursByClientTool } from "./tools/reports";
import { z } from "zod";
import { argv } from "process";

export const configSchema = z.object({
  clockifyApiToken: z.string().describe("Clockify API Token"),
  clockifyApiUrl: z
    .string()
    .optional()
    .describe(
      "Clockify API base URL. Workspaces hosted in a regional data center must use their regional URL, e.g. https://euc1.clockify.me/api/v1 (EU), https://use2.clockify.me/api/v1 (USA), https://euw2.clockify.me/api/v1 (UK) or https://apse2.clockify.me/api/v1 (AU). Defaults to https://api.clockify.me/api/v1"
    ),
});

const server = new McpServer(SERVER_CONFIG);

export default function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  api.defaults.headers.Authorization = `Bearer ${config.clockifyApiToken}`;
  if (config.clockifyApiUrl) {
    api.defaults.baseURL = config.clockifyApiUrl;
  }
  server.tool(
    createEntryTool.name,
    createEntryTool.description,
    createEntryTool.parameters,
    createEntryTool.handler
  );

  server.tool(
    findProjectTool.name,
    findProjectTool.description,
    findProjectTool.parameters,
    findProjectTool.handler
  );

  server.tool(
    listEntriesTool.name,
    listEntriesTool.description,
    listEntriesTool.parameters,
    listEntriesTool.handler
  );

  server.tool(
    getCurrentUserTool.name,
    getCurrentUserTool.description,
    getCurrentUserTool.handler
  );

  server.tool(
    findWorkspacesTool.name,
    findWorkspacesTool.description,
    findWorkspacesTool.handler
  );

  server.tool(
    deleteEntryTool.name,
    deleteEntryTool.description,
    deleteEntryTool.parameters,
    deleteEntryTool.handler
  );

  server.tool(
    editEntryTool.name,
    editEntryTool.description,
    editEntryTool.parameters,
    editEntryTool.handler
  );

  server.tool(
    getTagsTool.name,
    getTagsTool.description,
    getTagsTool.parameters,
    getTagsTool.handler
  );

  server.tool(
    createTagTool.name,
    createTagTool.description,
    createTagTool.parameters,
    createTagTool.handler
  );

  server.tool(
    listTasksTool.name,
    listTasksTool.description,
    listTasksTool.parameters,
    listTasksTool.handler
  );

  server.tool(
    createTaskTool.name,
    createTaskTool.description,
    createTaskTool.parameters,
    createTaskTool.handler
  );

  server.tool(
    updateTaskTool.name,
    updateTaskTool.description,
    updateTaskTool.parameters,
    updateTaskTool.handler
  );

  server.tool(
    deleteTaskTool.name,
    deleteTaskTool.description,
    deleteTaskTool.parameters,
    deleteTaskTool.handler
  );

  server.tool(
    getHoursByClientTool.name,
    getHoursByClientTool.description,
    getHoursByClientTool.parameters,
    getHoursByClientTool.handler
  );
  return server.server;
}

(() => {
  if (argv.find((flag) => flag === "--local")) {
    createStatelessServer({
      config: {
        clockifyApiToken: process.env.CLOCKIFY_API_TOKEN as string,
        clockifyApiUrl: process.env.CLOCKIFY_API_URL,
      },
    });
    const transport = new StdioServerTransport();
    server.connect(transport);
  }
})();
