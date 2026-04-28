import { z } from "zod";

export const employerSchema = z.object({
  id: z.number(),
  clientId: z.number().nullable(),

  organizationId: z
    .number().nullable(),

  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),

  active: z.boolean().nullable(),
});
export type EmployerForm = z.infer<typeof employerSchema>;