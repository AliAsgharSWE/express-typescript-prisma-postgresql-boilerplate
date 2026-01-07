import { Request, Response, NextFunction } from "express";
import { UserService } from "@/services/user.service";
import { BaseController } from "./base.controller";
import { AppError } from "@/utils/appError";

export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.userService.getMe(req.user.userId);
    });
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        throw new AppError("Unauthorized", 401);
      }
      return await this.userService.updateMe(req.user.userId, req.body);
    });
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.userService.getAllUsers(req.query as any);
    });
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "HR" && req.user.role !== "MANAGER" && req.user.userId !== req.params.id)) {
        throw new AppError("Not authorized to access this profile", 403);
      }
      return await this.userService.getUserById(req.params.id);
    });
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.userService.createUser(req.body);
    });
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      return await this.userService.updateUser(req.params.id, req.body);
    });
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { role } = req.body;
      return await this.userService.updateUserRole(req.params.id, role);
    });
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      await this.userService.deleteUser(req.params.id);
      return null;
    });
  };
}
