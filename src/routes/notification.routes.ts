import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";
import { NotificationService } from "@/services/notification.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  createNotificationSchema,
  markReadSchema,
  notificationQuerySchema,
} from "@/validators/notification.validator";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService);

router.get(
  "/",
  requireAuth,
  validateRequest(notificationQuerySchema),
  notificationController.getNotifications
);

router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(createNotificationSchema),
  notificationController.createNotification
);

router.put(
  "/:id/read",
  requireAuth,
  validateRequest(markReadSchema),
  notificationController.markAsRead
);

router.put(
  "/read-all",
  requireAuth,
  notificationController.markAllAsRead
);

export default router;
