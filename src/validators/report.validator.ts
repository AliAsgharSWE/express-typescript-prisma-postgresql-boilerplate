import { z } from "zod";

export const attendanceReportQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
    format: z.enum(["json", "csv", "pdf", "xlsx"]).default("json"),
  }),
});

export const performanceReportQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const exportReportQuerySchema = z.object({
  query: z.object({
    type: z.enum(["attendance", "performance"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
    format: z.enum(["csv", "pdf", "xlsx"]),
  }),
});
