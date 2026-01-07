import { Request, Response, NextFunction } from "express";
import { NotificationService } from "@/services/notification.service";
import { BaseController } from "./base.controller";
import { AppError } from "@/utils/appError";

export class NotificationController extends BaseController {
  constructor(private notificationService: NotificationService) {
    super();
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.notificationService.getNotifications(req.user.userId, req.query as any);
    });
  };

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.notificationService.createNotification(req.body);
    });
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.notificationService.markAsRead(req.params.id, req.user.userId);
    });
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.notificationService.markAllAsRead(req.user.userId);
    });
  };
}
