import { Router } from "express";
import { AuditController } from "@/controllers/audit.controller";
import { AuditService } from "@/services/audit.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const auditService = new AuditService();
const auditController = new AuditController(auditService);

router.get(
  "/logs",
  requireAuth,
  requireRole(["ADMIN"]),
  auditController.getAuditLogs
);

router.get(
  "/security/activity",
  requireAuth,
  requireRole(["ADMIN"]),
  auditController.getSecurityActivity
);

router.post(
  "/api-keys/rotate/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  auditController.rotateApiKey
);

router.post(
  "/api-keys/invalidate",
  requireAuth,
  requireRole(["ADMIN"]),
  auditController.invalidateApiKeys
);

export default router;
