import { api } from "../config/api";
import { fetchAllPages } from "../config/pagination";
import { z } from "zod";
import { McpResponse, McpToolConfig } from "../types";

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

    const data = await fetchAllPages<any>(`workspaces/${workspaceId}/tags`);
    const tags = data.map((tag) => ({
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
