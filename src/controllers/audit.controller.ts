import { Request, Response, NextFunction } from "express";
import { AuditService } from "@/services/audit.service";
import { BaseController } from "./base.controller";

export class AuditController extends BaseController {
  constructor(private auditService: AuditService) {
    super();
  }

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.auditService.getAuditLogs(req.query as any);
    });
  };

  getSecurityActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.auditService.getSecurityActivity(req.query as any);
    });
  };

  rotateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.auditService.rotateApiKey(req.params.id);
    });
  };

  invalidateApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.auditService.invalidateApiKeys();
    });
  };
}
