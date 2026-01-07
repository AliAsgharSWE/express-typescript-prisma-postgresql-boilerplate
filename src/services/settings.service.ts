import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

const prisma = new PrismaClient();

export class SettingsService {
  async getSettings() {
    const settings = await prisma.workspace_settings.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to object format
    const settingsObj: any = {};
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    // Default settings if not set
    return {
      defaultTimezone: settingsObj.defaultTimezone || "UTC",
      checkInWindow: settingsObj.checkInWindow || 30, // 30 minutes
      workingHours: settingsObj.workingHours || {
        start: "09:00",
        end: "18:00",
      },
      ...settingsObj,
    };
  }

  async updateSettings(data: {
    defaultTimezone?: string;
    checkInWindow?: number;
    workingHours?: { start: string; end: string };
    [key: string]: any;
  }, updatedBy?: string) {
    const updates = [];

    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      
      updates.push(
        prisma.workspace_settings.upsert({
          where: { key },
          update: {
            value: stringValue,
            updatedBy,
          },
          create: {
            key,
            value: stringValue,
            updatedBy,
          },
        })
      );
    }

    await Promise.all(updates);

    return await this.getSettings();
  }

  async getRoles() {
    const roles = await prisma.role_permission.findMany({
      orderBy: [{ role: "asc" }, { permission: "asc" }],
    });

    // Group by role
    const rolesObj: any = {};
    roles.forEach(rp => {
      if (!rolesObj[rp.role]) {
        rolesObj[rp.role] = {};
      }
      rolesObj[rp.role][rp.permission] = rp.enabled;
    });

    return rolesObj;
  }

  async updateRole(roleId: string, permissions: Record<string, boolean>) {
    // Note: roleId here is actually the role name string
    const updates = Object.entries(permissions).map(([permission, enabled]) =>
      prisma.role_permission.upsert({
        where: {
          role_permission: {
            role: roleId,
            permission,
          },
        },
        update: { enabled },
        create: {
          role: roleId,
          permission,
          enabled,
        },
      })
    );

    await Promise.all(updates);

    return await this.getRoles();
  }

  async deleteWorkspace() {
    // This is a dangerous operation - in production, you'd want additional safeguards
    // For now, we'll just return a confirmation message
    // In a real implementation, you'd delete all data or mark workspace as deleted
    
    return {
      message: "Workspace deletion initiated. This is a destructive operation.",
      note: "In production, implement proper workspace deletion with data backup and confirmation steps.",
    };
  }
}
