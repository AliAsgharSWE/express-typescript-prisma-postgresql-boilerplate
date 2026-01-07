import { Request, Response, NextFunction } from "express";
import { DashboardService } from "@/services/dashboard.service";
import { BaseController } from "./base.controller";

export class DashboardController extends BaseController {
  constructor(private dashboardService: DashboardService) {
    super();
  }

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.dashboardService.getSummary();
    });
  };
}
