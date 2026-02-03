import { AxiosInstance } from "axios";
import { api } from "../config/api";
import {
  TCreateEntrySchema,
  TFindEntrySchema,
  TDeleteEntrySchema,
  TEditEntrySchema,
} from "../types";
import { URLSearchParams } from "node:url";

function EntriesService(api: AxiosInstance) {
  async function create(entry: TCreateEntrySchema) {
    const { workspaceId, ...rest } = entry;

    // Filter out undefined values to avoid sending nulls to Clockify
    const body = Object.fromEntries(
      Object.entries(rest).filter(([_, value]) => value !== undefined)
    );

    return api.post(`workspaces/${workspaceId}/time-entries`, body);
  }

  async function find(filters: TFindEntrySchema) {
    const searchParams = new URLSearchParams();

    if (filters.description)
      searchParams.append("description", filters.description);

    if (filters.start)
      searchParams.append("start", filters.start.toISOString());

    if (filters.end) searchParams.append("end", filters.end.toISOString());

    if (filters.project) searchParams.append("project", filters.project);

    return api.get(
      `https://api.clockify.me/api/v1/workspaces/${filters.workspaceId}/user/${
        filters.userId
      }/time-entries?${searchParams.toString()}`
    );
  }

  async function deleteEntry(params: TDeleteEntrySchema) {
    return api.delete(
      `workspaces/${params.workspaceId}/time-entries/${params.timeEntryId}`
    );
  }

  async function update(params: TEditEntrySchema) {
    const { workspaceId, timeEntryId, ...rest } = params;

    // Filter out undefined values to avoid sending nulls to Clockify
    const body = Object.fromEntries(
      Object.entries(rest).filter(([_, value]) => value !== undefined)
    );

    return api.put(
      `workspaces/${workspaceId}/time-entries/${timeEntryId}`,
      body
    );
  }

  async function getById(workspaceId: string, timeEntryId: string) {
    return api.get(`workspaces/${workspaceId}/time-entries/${timeEntryId}`);
  }

  return { create, find, deleteEntry, update, getById };
}

export const entriesService = EntriesService(api);
