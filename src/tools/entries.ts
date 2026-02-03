import { z } from "zod";
import { TOOLS_CONFIG } from "../config/api";
import { entriesService } from "../clockify-sdk/entries";
import {
  McpResponse,
  McpToolConfig,
  TCreateEntrySchema,
  TFindEntrySchema,
  TDeleteEntrySchema,
  TEditEntrySchema,
} from "../types";

export const createEntryTool: McpToolConfig = {
  name: TOOLS_CONFIG.entries.create.name,
  description: TOOLS_CONFIG.entries.create.description,
  parameters: {
    workspaceId: z
      .string()
      .describe("The id of the workspace that gonna be saved the time entry"),
    billable: z
      .boolean()
      .describe("If the task is billable or not")
      .optional()
      .default(true),
    description: z.string().describe("The description of the time entry"),
    start: z.coerce.date().describe("The start of the time entry"),
    end: z.coerce.date().describe("The end of the time entry"),
    projectId: z
      .string()
      .optional()
      .describe("The id of the project associated with this time entry"),
    taskId: z
      .string()
      .optional()
      .describe("The id of the task (activity) within the project to associate with this time entry"),
    tagIds: z
      .array(z.string())
      .optional()
      .describe("Array of tag IDs to associate with this time entry"),
  },
  handler: async (params: TCreateEntrySchema): Promise<McpResponse> => {
    try {
      const result = await entriesService.create(params);

      const entryInfo = `Time entry created successfully. ID: ${result.data.id} Name: ${result.data.description}`;

      return {
        content: [
          {
            type: "text",
            text: entryInfo,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to create entry: ${error.message}`);
    }
  },
};

export const listEntriesTool: McpToolConfig = {
  name: TOOLS_CONFIG.entries.list.name,
  description: TOOLS_CONFIG.entries.list.description,
  parameters: {
    workspaceId: z
      .string()
      .describe("The id of the workspace that gonna search for the entries"),
    userId: z
      .string()
      .describe(
        "The id of the user that gonna have the entries searched, default is the current user id"
      ),
    description: z
      .string()
      .optional()
      .describe("The time entry description to search for"),
    start: z.coerce
      .date()
      .optional()
      .describe("Start time of the entry to search for"),
    end: z.coerce
      .date()
      .optional()
      .describe("End time of the entry to search for"),
    project: z
      .string()
      .optional()
      .describe("The id of the project to search for entries"),
  },
  handler: async (params: TFindEntrySchema) => {
    try {
      const result = await entriesService.find(params);

      const formmatedResults = result.data.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        duration: entry.duration,
        start: entry.start,
        end: entry.end,
        projectId: entry.projectId,
        projectName: entry.project?.name,
        taskId: entry.taskId,
        taskName: entry.task?.name,
        tags: entry.tags?.map((tag: any) => tag.name) || [],
        tagIds: entry.tagIds || [],
        timeInterval: entry.timeInterval,
        billable: entry.billable,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formmatedResults),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve entries: ${error.message}`);
    }
  },
};

export const deleteEntryTool: McpToolConfig = {
  name: TOOLS_CONFIG.entries.delete.name,
  description: TOOLS_CONFIG.entries.delete.description,
  parameters: {
    workspaceId: z
      .string()
      .describe("The id of the workspace where the time entry is located"),
    timeEntryId: z.string().describe("The id of the time entry to be deleted"),
  },
  handler: async (params: TDeleteEntrySchema): Promise<McpResponse> => {
    try {
      await entriesService.deleteEntry(params);

      return {
        content: [
          {
            type: "text",
            text: `Time entry with ID ${params.timeEntryId} was deleted successfully.`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to delete entry: ${error.message}`);
    }
  },
};

export const editEntryTool: McpToolConfig = {
  name: TOOLS_CONFIG.entries.edit.name,
  description: TOOLS_CONFIG.entries.edit.description,
  parameters: {
    workspaceId: z
      .string()
      .describe("The id of the workspace where the time entry is located"),
    timeEntryId: z.string().describe("The id of the time entry to be edited"),
    billable: z.boolean().describe("If the task is billable or not").optional(),
    description: z
      .string()
      .describe("The description of the time entry")
      .optional(),
    start: z.coerce.date().describe("The start of the time entry").optional(),
    end: z.coerce.date().describe("The end of the time entry").optional(),
    projectId: z
      .string()
      .optional()
      .describe("The id of the project associated with this time entry"),
    taskId: z
      .string()
      .optional()
      .describe("The id of the task (activity) within the project to associate with this time entry"),
    tagIds: z
      .array(z.string())
      .optional()
      .describe("Array of tag IDs to associate with this time entry"),
  },
  handler: async (params: TEditEntrySchema): Promise<McpResponse> => {
    try {
      let start = params.start;
      if (!start) {
        const current = await entriesService.getById(
          params.workspaceId,
          params.timeEntryId
        );
        start = new Date(current.data.timeInterval.start);
      }
      const result = await entriesService.update({
        ...params,
        start,
      });

      const entryInfo = `Time entry updated successfully. ID: ${result.data.id} Name: ${result.data.description}`;

      return {
        content: [
          {
            type: "text",
            text: entryInfo,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to edit entry: ${error.message}`);
    }
  },
};
