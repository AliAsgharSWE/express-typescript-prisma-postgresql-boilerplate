import { Request, Response, NextFunction } from "express";
import { ReportService } from "@/services/report.service";
import { BaseController } from "./base.controller";

export class ReportController extends BaseController {
  constructor(private reportService: ReportService) {
    super();
  }

  getAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.reportService.getAttendanceReport(req.query as any);
    });
  };

  getPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.reportService.getPerformanceReport(req.query as any);
    });
  };

  exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { type, format, ...filters } = req.query as any;
      return await this.reportService.exportReport(type, format, filters);
    });
  };

  getKeyInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.reportService.getKeyInsights(req.query as any);
    });
  };
}
