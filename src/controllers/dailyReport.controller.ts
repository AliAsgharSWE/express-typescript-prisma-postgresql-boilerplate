import { Request, Response, NextFunction } from "express";
import { DailyReportService } from "@/services/dailyReport.service";
import { BaseController } from "./base.controller";
import { AppError } from "@/utils/appError";

export class DailyReportController extends BaseController {
  constructor(private dailyReportService: DailyReportService) {
    super();
  }

  createDailyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.dailyReportService.createDailyReport(req.user.userId, req.body);
    });
  };

  getEmployeeDailyReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.dailyReportService.getEmployeeDailyReports(
        req.params.employeeId,
        req.query as any
      );
    });
  };

  updateDailyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.dailyReportService.updateDailyReport(
        req.params.id,
        req.body,
        req.user.userId
      );
    });
  };

  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const file = req.file as Express.Multer.File;
      const { wfhRequestId, dailyReportId } = req.body;
      return await this.dailyReportService.uploadAttachment(file, wfhRequestId, dailyReportId);
    });
  };
}
