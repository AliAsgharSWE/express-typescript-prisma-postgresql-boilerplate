import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(99),
    email: z.string().email().max(99),
    password: z.string().min(8).max(100),
    role: z.enum(["ADMIN", "USER", "MANAGER", "HR"]).optional(),
    department: z.string().max(100).optional(),
    contact: z.string().max(50).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(99).optional(),
    email: z.string().email().max(99).optional(),
    role: z.enum(["ADMIN", "USER", "MANAGER", "HR"]).optional(),
    department: z.string().max(100).optional(),
    contact: z.string().max(50).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(99).optional(),
    contact: z.string().max(50).optional(),
    password: z.string().min(8).max(100).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "USER", "MANAGER", "HR"]),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const userQuerySchema = z.object({
  query: z.object({
    department: z.string().optional(),
    status: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default("20"),
  }),
});
