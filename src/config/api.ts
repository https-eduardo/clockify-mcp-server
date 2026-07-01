import axios from "axios";

export const api = axios.create({
  baseURL: process.env.CLOCKIFY_API_URL || 'https://api.clockify.me/api/v1',
  headers: {
    "X-Api-Key": `${process.env.CLOCKIFY_API_TOKEN}`,
  },
});

export const SERVER_CONFIG = {
  name: "Clockify MCP Server",
  version: "1.0.0",
  description:
    "A service that integrates with Clockify API to manage time entries",
};

export const TOOLS_CONFIG = {
  workspaces: {
    list: {
      name: "get-workspaces",
      description:
        "Get user available workspaces id and name, a workspace is required to manage time entries",
    },
  },
  projects: {
    list: {
      name: "get-projects",
      description:
        "Get workspace projects id and name, the projects can be associated with time entries",
    },
  },
  users: {
    current: {
      name: "get-current-user",
      description:
        "Get the current user id and name, to search for entries is required to have the user id",
    },
  },
  entries: {
    create: {
      name: "create-time-entry",
      description:
        "Register a new time entry of a task or break in a workspace",
    },
    list: {
      name: "list-time-entries",
      description: "Get registered time entries from a workspace",
    },
    delete: {
      name: "delete-time-entry",
      description: "Delete a specific time entry from a workspace",
    },
    edit: {
      name: "edit-time-entry",
      description: "Edit an existing time entry in a workspace",
    },
  },
  reports: {
    hoursByClient: {
      name: "get-hours-by-client",
      description:
        "Get total hours worked per client for a date range in a workspace, aggregated on the server. Returns a compact summary (hours per client + total) instead of raw time entries. Note: projects are grouped by their Clockify client name.",
    },
  },
};
