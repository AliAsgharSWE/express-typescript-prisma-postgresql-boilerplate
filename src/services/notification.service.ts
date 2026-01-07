import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

const prisma = new PrismaClient();

export class NotificationService {
  async getNotifications(userId: string, filters: {
    read?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async createNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type?: string;
  }) {
    // If userId is provided, send to specific user
    // Otherwise, send to all users (broadcast)
    if (data.userId) {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: (data.type as any) || "INFO",
        },
      });
      return notification;
    } else {
      // Broadcast to all active users
      const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      });

      const notifications = await Promise.all(
        users.map(user =>
          prisma.notification.create({
            data: {
              userId: user.id,
              title: data.title,
              message: data.message,
              type: (data.type as any) || "INFO",
            },
          })
        )
      );

      return {
        message: `Notification sent to ${notifications.length} users`,
        count: notifications.length,
      };
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404, ErrorCode.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new AppError("Unauthorized", 403, ErrorCode.FORBIDDEN);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return {
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    };
  }
}
