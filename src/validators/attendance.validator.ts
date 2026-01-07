import { z } from "zod";

export const checkInSchema = z.object({
  body: z.object({
    location: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    timezone: z.string().default("UTC"),
  }),
});

export const checkOutSchema = z.object({
  body: z.object({
    location: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
});

export const wfhRequestSchema = z.object({
  body: z.object({
    date: z.string().datetime(),
    reason: z.string().min(10).max(1000),
  }),
});

export const updateWFHRequestSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const attendanceQuerySchema = z.object({
  query: z.object({
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"]).optional(),
    userId: z.string().uuid().optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
  }),
});

export const attendanceStatsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const attendanceCalendarSchema = z.object({
  params: z.object({
    employeeId: z.string().uuid(),
  }),
  query: z.object({
    month: z.string().optional(),
    year: z.string().optional(),
  }),
});
