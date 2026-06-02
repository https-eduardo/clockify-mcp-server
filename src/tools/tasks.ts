import { api } from "../config/api";
import { fetchAllPages } from "../config/pagination";
import { z } from "zod";
import { McpResponse, McpToolConfig } from "../types";

export const createTaskTool: McpToolConfig = {
  name: "create-task",
  description:
    "Create a new task (activity) within a project. The created task can be associated with time entries.",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace that contains the project"),
    projectId: z
      .string()
      .describe("The ID of the project to create the task in"),
    name: z.string().describe("The name of the task to create"),
    assigneeIds: z
      .array(z.string())
      .optional()
      .describe("Optional array of user IDs to assign to the task"),
    status: z
      .enum(["ACTIVE", "DONE"])
      .optional()
      .describe("Optional status of the task (defaults to ACTIVE)"),
  },
  handler: async ({
    workspaceId,
    projectId,
    name,
    assigneeIds,
    status,
  }: {
    workspaceId: string;
    projectId: string;
    name: string;
    assigneeIds?: string[];
    status?: "ACTIVE" | "DONE";
  }): Promise<McpResponse> => {
    if (!workspaceId || typeof workspaceId !== "string") {
      throw new Error("Workspace ID required to create a task");
    }
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Project ID required to create a task");
    }
    if (!name || typeof name !== "string") {
      throw new Error("Task name required to create a task");
    }

    const response = await api.post(
      `workspaces/${workspaceId}/projects/${projectId}/tasks`,
      {
        name,
        ...(assigneeIds ? { assigneeIds } : {}),
        ...(status ? { status } : {}),
      }
    );

    const task = response.data;
    return {
      content: [
        {
          type: "text",
          text: `Task created successfully. ID: ${task.id} Name: ${task.name} Status: ${task.status}`,
        },
      ],
    };
  },
};

export const listTasksTool: McpToolConfig = {
  name: "list-tasks",
  description: "List tasks (activities) within a project. Tasks can be associated with time entries.",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace"),
    projectId: z
      .string()
      .describe("The ID of the project to get tasks from"),
  },
  handler: async ({ workspaceId, projectId }: { workspaceId: string; projectId: string }): Promise<McpResponse> => {
    if (!workspaceId || typeof workspaceId !== "string") {
      throw new Error("Workspace ID required to fetch tasks");
    }
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Project ID required to fetch tasks");
    }

    const data = await fetchAllPages<any>(`workspaces/${workspaceId}/projects/${projectId}/tasks`);
    const tasks = data.map((task: any) => ({
      id: task.id,
      name: task.name,
      projectId: task.projectId,
      status: task.status,
      assigneeIds: task.assigneeIds,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(tasks),
        },
      ],
    };
  },
};
