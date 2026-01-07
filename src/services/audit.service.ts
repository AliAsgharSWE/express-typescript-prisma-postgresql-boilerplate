import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import crypto from "crypto";

const prisma = new PrismaClient();

export class AuditService {
  async logActivity(data: {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.audit_log.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.resource) {
      where.resource = filters.resource;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.audit_log.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.audit_log.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async logSecurityActivity(data: {
    userId?: string;
    action: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
  }) {
    return await prisma.security_activity.create({
      data: {
        userId: data.userId,
        action: data.action as any,
        success: data.success,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details || {},
      },
    });
  }

  async getSecurityActivity(filters: {
    userId?: string;
    action?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.success !== undefined) {
      where.success = filters.success;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [activities, total] = await Promise.all([
      prisma.security_activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.security_activity.count({ where }),
    ]);

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async rotateApiKey(keyId: string) {
    const apiKey = await prisma.api_key.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      throw new AppError("API key not found", 404, ErrorCode.NOT_FOUND);
    }

    const newKey = crypto.randomBytes(32).toString("hex");

    const updated = await prisma.api_key.update({
      where: { id: keyId },
      data: {
        key: newKey,
        lastUsedAt: null,
      },
    });

    return {
      id: updated.id,
      key: updated.key,
      message: "API key rotated successfully",
    };
  }

  async invalidateApiKeys() {
    const result = await prisma.api_key.updateMany({
      where: { active: true },
      data: { active: false },
    });

    return {
      message: `Invalidated ${result.count} API keys`,
      count: result.count,
    };
  }
}
