import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

export class DailyReportService {
  async createDailyReport(userId: string, data: {
    date: string;
    content: string;
  }) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    // Check if report already exists for this date
    const existing = await prisma.daily_report.findFirst({
      where: {
        userId,
        date,
      },
    });

    if (existing) {
      throw new AppError(
        "Daily report already exists for this date",
        400,
        ErrorCode.ALREADY_EXISTS
      );
    }

    const report = await prisma.daily_report.create({
      data: {
        userId,
        date,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    return report;
  }

  async getEmployeeDailyReports(employeeId: string, filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId: employeeId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const [reports, total] = await Promise.all([
      prisma.daily_report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
      }),
      prisma.daily_report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateDailyReport(reportId: string, data: {
    hrFeedback: string;
    status: "APPROVED" | "REJECTED";
  }, approvedBy: string) {
    const report = await prisma.daily_report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new AppError("Daily report not found", 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.daily_report.update({
      where: { id: reportId },
      data: {
        hrFeedback: data.hrFeedback,
        status: data.status,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    return updated;
  }

  async uploadAttachment(file: Express.Multer.File, wfhRequestId?: string, dailyReportId?: string) {
    if (!file) {
      throw new AppError("No file provided", 400, ErrorCode.INVALID_INPUT);
    }

    // In production, you'd want to:
    // 1. Validate file type and size
    // 2. Store files in cloud storage (S3, etc.)
    // 3. Generate unique file names
    // 4. Handle file uploads properly

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file (in production, use proper file storage)
    fs.writeFileSync(filePath, file.buffer);

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        filePath: filePath,
        fileType: file.mimetype,
        fileSize: file.size,
        wfhRequestId,
        dailyReportId,
      },
    });

    return attachment;
  }
}
