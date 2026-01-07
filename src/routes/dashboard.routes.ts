import { Router } from "express";
import { DashboardController } from "@/controllers/dashboard.controller";
import { DashboardService } from "@/services/dashboard.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const dashboardService = new DashboardService();
const dashboardController = new DashboardController(dashboardService);

router.get(
  "/summary",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  dashboardController.getSummary
);

export default router;
