import { api } from "../config/api";
import { z } from "zod";
import { McpResponse, McpToolConfig } from "../types";

export const createTagTool: McpToolConfig = {
  name: "create-tag",
  description: "Create a new tag in a workspace",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace to create the tag in"),
    name: z.string().describe("The name of the tag to create"),
  },
  handler: async ({
    workspaceId,
    name,
  }: {
    workspaceId: string;
    name: string;
  }): Promise<McpResponse> => {
    const response = await api.post(`workspaces/${workspaceId}/tags`, {
      name,
    });

    return {
      content: [
        {
          type: "text",
          text: `Tag created successfully. ID: ${response.data.id} Name: ${response.data.name}`,
        },
      ],
    };
  },
};

export const getTagsTool: McpToolConfig = {
  name: "get-tags",
  description: "Get all tags in a workspace",
  parameters: {
    workspaceId: z
      .string()
      .describe("The ID of the workspace to get tags from"),
  },
  handler: async ({ workspaceId }: { workspaceId: string }): Promise<McpResponse> => {
    if (!workspaceId || typeof workspaceId !== "string") {
      throw new Error("Workspace ID required to fetch tags");
    }

    const response = await api.get(`workspaces/${workspaceId}/tags`);
    const tags = response.data.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      workspaceId: tag.workspaceId,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(tags),
        },
      ],
    };
  },
};
