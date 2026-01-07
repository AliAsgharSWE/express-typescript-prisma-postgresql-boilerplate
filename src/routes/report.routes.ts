import { Router } from "express";
import { ReportController } from "@/controllers/report.controller";
import { ReportService } from "@/services/report.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  attendanceReportQuerySchema,
  performanceReportQuerySchema,
  exportReportQuerySchema,
} from "@/validators/report.validator";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const reportService = new ReportService();
const reportController = new ReportController(reportService);

router.get(
  "/attendance",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(attendanceReportQuerySchema),
  reportController.getAttendanceReport
);

router.get(
  "/performance",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(performanceReportQuerySchema),
  reportController.getPerformanceReport
);

router.get(
  "/export",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(exportReportQuerySchema),
  reportController.exportReport
);

router.get(
  "/key-insights",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  reportController.getKeyInsights
);

export default router;
