import { z } from "zod";

export const CreateEntrySchema = z.object({
  workspaceId: z.string(),
  billable: z.boolean(),
  description: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});
