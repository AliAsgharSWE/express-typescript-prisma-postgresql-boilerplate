import { Request, Response, NextFunction } from "express";
import { SettingsService } from "@/services/settings.service";
import { BaseController } from "./base.controller";

export class SettingsController extends BaseController {
  constructor(private settingsService: SettingsService) {
    super();
  }

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.settingsService.getSettings();
    });
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.settingsService.updateSettings(
        req.body,
        req.user?.userId
      );
    });
  };

  getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.settingsService.getRoles();
    });
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.settingsService.updateRole(req.params.id, req.body.permissions);
    });
  };

  deleteWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.settingsService.deleteWorkspace();
    });
  };
}
