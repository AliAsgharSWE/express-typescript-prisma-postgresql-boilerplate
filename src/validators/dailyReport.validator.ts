import { z } from "zod";

export const createDailyReportSchema = z.object({
  body: z.object({
    date: z.string().datetime(),
    content: z.string().min(10).max(5000),
  }),
});

export const updateDailyReportSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    hrFeedback: z.string().min(1).max(1000),
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
});

export const dailyReportQuerySchema = z.object({
  params: z.object({
    employeeId: z.string().uuid(),
  }),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
  }),
});
