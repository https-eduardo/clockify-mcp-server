import { api } from "../config/api";
import { z } from "zod";
import { McpResponse, McpToolConfig } from "../types";

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

    const response = await api.get(`workspaces/${workspaceId}/projects/${projectId}/tasks`);
    const tasks = response.data.map((task: any) => ({
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
