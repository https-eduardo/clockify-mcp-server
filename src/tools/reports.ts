import { z } from "zod";
import { TOOLS_CONFIG } from "../config/api";
import { entriesService } from "../clockify-sdk/entries";
import { projectsService } from "../clockify-sdk/projects";
import { usersService } from "../clockify-sdk/users";
import { McpResponse, McpToolConfig } from "../types";

/**
 * Derive the hours for a single time entry.
 * Prefers the ISO-8601 duration (e.g. "PT8H30M"); falls back to end - start.
 * Returns 0 for running or unparseable entries (they are skipped by the caller).
 */
function entryHours(entry: any): number {
  const iso: string | undefined = entry?.timeInterval?.duration ?? entry?.duration;
  if (iso) {
    const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(iso);
    if (m) {
      return Number(m[1] || 0) + Number(m[2] || 0) / 60 + Number(m[3] || 0) / 3600;
    }
  }
  const start = entry?.timeInterval?.start ?? entry?.start;
  const end = entry?.timeInterval?.end ?? entry?.end;
  if (start && end) {
    return (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  }
  return 0;
}

export const getHoursByClientTool: McpToolConfig = {
  name: TOOLS_CONFIG.reports.hoursByClient.name,
  description: TOOLS_CONFIG.reports.hoursByClient.description,
  parameters: {
    workspaceId: z
      .string()
      .describe("The id of the workspace to aggregate hours from"),
    userId: z
      .string()
      .optional()
      .describe("The id of the user; defaults to the current user"),
    start: z.coerce
      .date()
      .optional()
      .describe("Start of the date range (ISO), e.g. 2026-06-01T00:00:00Z"),
    end: z.coerce
      .date()
      .optional()
      .describe("End of the date range (ISO), e.g. 2026-07-01T00:00:00Z"),
    roundToHours: z
      .boolean()
      .optional()
      .default(true)
      .describe("Round each client's total to the nearest whole hour"),
  },
  handler: async (params: any): Promise<McpResponse> => {
    try {
      const userId =
        params.userId || (await usersService.getCurrent()).data.id;

      const [{ data: entries }, { data: projects }] = await Promise.all([
        entriesService.find({
          workspaceId: params.workspaceId,
          userId,
          start: params.start,
          end: params.end,
        }),
        projectsService.fetchAll(params.workspaceId),
      ]);

      const clientOf: Record<string, string> = {};
      for (const p of projects) {
        clientOf[p.id] = p.clientName || p.name || "No Client";
      }

      const totals: Record<string, number> = {};
      let skipped = 0;
      for (const entry of entries) {
        const hours = entryHours(entry);
        if (hours <= 0) {
          skipped++;
          continue;
        }
        const client = entry.projectId
          ? clientOf[entry.projectId] || "Unknown Project"
          : "No Project";
        totals[client] = (totals[client] || 0) + hours;
      }

      const round = params.roundToHours !== false;
      const hoursByClient: Record<string, number> = {};
      let grand = 0;
      for (const [client, h] of Object.entries(totals)) {
        grand += h;
        const val = round ? Math.round(h) : Math.round(h * 100) / 100;
        if (val > 0) hoursByClient[client] = val;
      }

      const summary = {
        workspaceId: params.workspaceId,
        userId,
        start: params.start ? new Date(params.start).toISOString() : null,
        end: params.end ? new Date(params.end).toISOString() : null,
        entryCount: entries.length,
        skippedRunningOrEmpty: skipped,
        hoursByClient,
        totalHours: round ? Math.round(grand) : Math.round(grand * 100) / 100,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(summary) }],
      };
    } catch (error: any) {
      throw new Error(`Failed to aggregate hours by client: ${error.message}`);
    }
  },
};
