import { Router } from "express";
import { SettingsController } from "@/controllers/settings.controller";
import { SettingsService } from "@/services/settings.service";
import { validateRequest } from "@/middleware/validateRequest";
import { updateSettingsSchema, updateRoleSchema } from "@/validators/settings.validator";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const settingsService = new SettingsService();
const settingsController = new SettingsController(settingsService);

router.get(
  "/",
  requireAuth,
  settingsController.getSettings
);

router.put(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateSettingsSchema),
  settingsController.updateSettings
);

router.get(
  "/roles",
  requireAuth,
  requireRole(["ADMIN"]),
  settingsController.getRoles
);

router.put(
  "/roles/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateRoleSchema),
  settingsController.updateRole
);

router.post(
  "/workspace/delete",
  requireAuth,
  requireRole(["ADMIN"]),
  settingsController.deleteWorkspace
);

export default router;
