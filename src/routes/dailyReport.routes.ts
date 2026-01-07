import { Router } from "express";
import { DailyReportController } from "@/controllers/dailyReport.controller";
import { DailyReportService } from "@/services/dailyReport.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  createDailyReportSchema,
  updateDailyReportSchema,
  dailyReportQuerySchema,
} from "@/validators/dailyReport.validator";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";
import multer from "multer";

const router = Router();

const dailyReportService = new DailyReportService();
const dailyReportController = new DailyReportController(dailyReportService);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post(
  "/daily",
  requireAuth,
  validateRequest(createDailyReportSchema),
  dailyReportController.createDailyReport
);

router.get(
  "/daily/:employeeId",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(dailyReportQuerySchema),
  dailyReportController.getEmployeeDailyReports
);

router.put(
  "/daily/:id",
  requireAuth,
  requireRole(["ADMIN", "HR"]),
  validateRequest(updateDailyReportSchema),
  dailyReportController.updateDailyReport
);

router.post(
  "/attachments/upload",
  requireAuth,
  upload.single("file"),
  dailyReportController.uploadAttachment
);

export default router;
