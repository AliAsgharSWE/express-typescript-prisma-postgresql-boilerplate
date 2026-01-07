import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "@/services/attendance.service";
import { BaseController } from "./base.controller";
import { AppError } from "@/utils/appError";

export class AttendanceController extends BaseController {
  constructor(private attendanceService: AttendanceService) {
    super();
  }

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.attendanceService.checkIn(req.user.userId, req.body);
    });
  };

  checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.attendanceService.checkOut(req.user.userId, req.body);
    });
  };

  getMyAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.attendanceService.getMyAttendance(req.user.userId, req.query as any);
    });
  };

  getAllAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.attendanceService.getAllAttendance(req.query as any);
    });
  };

  createWFHRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.attendanceService.createWFHRequest(req.user.userId, req.body);
    });
  };

  updateWFHRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      const { status } = req.body;
      return await this.attendanceService.updateWFHRequest(
        req.params.id,
        status,
        req.user.userId
      );
    });
  };

  getWFHRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.attendanceService.getWFHRequests(req.query as any);
    });
  };

  getAttendanceStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.attendanceService.getAttendanceStats(req.query as any);
    });
  };

  getAttendanceCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      return await this.attendanceService.getAttendanceCalendar(
        employeeId,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
    });
  };
}
