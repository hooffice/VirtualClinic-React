import { z } from "zod";

export const clinicianClinicSchema = z.object({
    id: z.number(),
    clinicId: z.number().nullable().superRefine((val, ctx) => {
        if (val === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Clinic is required",
            });
        }
    }),
    clinicianId: z.number(),
    active: z.boolean(),
    primary: z.boolean()
})

export type ClinicianClinicForm = z.infer<typeof clinicianClinicSchema>;