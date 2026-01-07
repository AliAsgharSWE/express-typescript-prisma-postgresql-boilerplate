import { Router } from "express";
import { AttendanceController } from "@/controllers/attendance.controller";
import { AttendanceService } from "@/services/attendance.service";
import { validateRequest } from "@/middleware/validateRequest";
import {
  checkInSchema,
  checkOutSchema,
  wfhRequestSchema,
  updateWFHRequestSchema,
  attendanceQuerySchema,
  attendanceStatsQuerySchema,
  attendanceCalendarSchema,
} from "@/validators/attendance.validator";
import { requireAuth } from "@/middleware/authMiddleware";
import { requireRole } from "@/middleware/authMiddleware";

const router = Router();

const attendanceService = new AttendanceService();
const attendanceController = new AttendanceController(attendanceService);

// Check-in/Check-out routes
router.post(
  "/check-in",
  requireAuth,
  validateRequest(checkInSchema),
  attendanceController.checkIn
);

router.post(
  "/check-out",
  requireAuth,
  validateRequest(checkOutSchema),
  attendanceController.checkOut
);

// My attendance
router.get(
  "/me",
  requireAuth,
  validateRequest(attendanceQuerySchema),
  attendanceController.getMyAttendance
);

// Admin routes - All attendance
router.get(
  "/",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(attendanceQuerySchema),
  attendanceController.getAllAttendance
);

// WFH requests
router.post(
  "/wfh-request",
  requireAuth,
  validateRequest(wfhRequestSchema),
  attendanceController.createWFHRequest
);

router.put(
  "/wfh-request/:id",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  validateRequest(updateWFHRequestSchema),
  attendanceController.updateWFHRequest
);

router.get(
  "/wfh-requests",
  requireAuth,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  attendanceController.getWFHRequests
);

// Stats
router.get(
  "/stats",
  requireAuth,
  validateRequest(attendanceStatsQuerySchema),
  attendanceController.getAttendanceStats
);

// Calendar
router.get(
  "/calendar/:employeeId",
  requireAuth,
  validateRequest(attendanceCalendarSchema),
  attendanceController.getAttendanceCalendar
);

export default router;
