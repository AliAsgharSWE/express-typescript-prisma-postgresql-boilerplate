import { z } from "zod";

export const updateSettingsSchema = z.object({
  body: z.object({
    defaultTimezone: z.string().optional(),
    checkInWindow: z.number().int().min(0).optional(), // minutes
    workingHours: z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    }).optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    permissions: z.record(z.string(), z.boolean()),
  }),
});
