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

export const updateTaskTool: McpToolConfig = {
  name: "update-task",
  description:
    "Update a task (activity) in a project: rename it, change its status (ACTIVE/DONE), and/or reassign it. Clockify's PUT requires a name, so if you omit `name` the task's current name is fetched and preserved (lets you mark DONE or reassign without renaming).",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace that contains the project"),
    projectId: z
      .string()
      .describe("The ID of the project that contains the task"),
    taskId: z.string().describe("The ID of the task to update"),
    name: z
      .string()
      .optional()
      .describe("New task name (rename). If omitted, the existing name is preserved."),
    status: z
      .enum(["ACTIVE", "DONE"])
      .optional()
      .describe("New status for the task"),
    assigneeIds: z
      .array(z.string())
      .optional()
      .describe("Replacement array of assignee user IDs"),
  },
  handler: async ({
    workspaceId,
    projectId,
    taskId,
    name,
    status,
    assigneeIds,
  }: {
    workspaceId: string;
    projectId: string;
    taskId: string;
    name?: string;
    status?: "ACTIVE" | "DONE";
    assigneeIds?: string[];
  }): Promise<McpResponse> => {
    if (!workspaceId || typeof workspaceId !== "string") {
      throw new Error("Workspace ID required to update a task");
    }
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Project ID required to update a task");
    }
    if (!taskId || typeof taskId !== "string") {
      throw new Error("Task ID required to update a task");
    }
    if (name === undefined && status === undefined && assigneeIds === undefined) {
      throw new Error(
        "Provide at least one of name, status, or assigneeIds to update"
      );
    }

    const path = `workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`;

    // Clockify's PUT is a full replace and requires a name; preserve the
    // current one when the caller only wants to change status/assignees.
    let taskName = name;
    if (taskName === undefined) {
      const got = await api.get(path);
      taskName = got.data?.name;
    }

    const response = await api.put(path, {
      name: taskName,
      ...(status ? { status } : {}),
      ...(assigneeIds ? { assigneeIds } : {}),
    });

    const task = response.data;
    return {
      content: [
        {
          type: "text",
          text: `Task updated successfully. ID: ${task.id} Name: ${task.name} Status: ${task.status}`,
        },
      ],
    };
  },
};

export const deleteTaskTool: McpToolConfig = {
  name: "delete-task",
  description:
    "Permanently delete a task (activity) from a project. Requires an admin API token — Clockify returns 403 for non-admins regardless of the task's status. To close a task without deleting it, use update-task with status DONE.",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace that contains the project"),
    projectId: z
      .string()
      .describe("The ID of the project that contains the task"),
    taskId: z.string().describe("The ID of the task to delete"),
  },
  handler: async ({
    workspaceId,
    projectId,
    taskId,
  }: {
    workspaceId: string;
    projectId: string;
    taskId: string;
  }): Promise<McpResponse> => {
    if (!workspaceId || typeof workspaceId !== "string") {
      throw new Error("Workspace ID required to delete a task");
    }
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Project ID required to delete a task");
    }
    if (!taskId || typeof taskId !== "string") {
      throw new Error("Task ID required to delete a task");
    }

    try {
      await api.delete(
        `workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
    } catch (err: any) {
      if (err?.response?.status === 403) {
        // The task is left untouched — surface an actionable message so the
        // caller knows deletion is admin-only (not a task-status problem).
        throw new Error(
          "Delete failed: this Clockify token lacks admin permission to delete tasks " +
            "(Clockify 403). The task was NOT deleted. To close it instead, use update-task " +
            "with status DONE, or have a workspace admin delete it in the Clockify UI."
        );
      }
      throw err;
    }

    return {
      content: [
        {
          type: "text",
          text: `Task deleted successfully. ID: ${taskId}`,
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
